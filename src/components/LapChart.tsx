import React, { useEffect, useState } from 'react';
import { getDriversForSession, getLapsForSession } from '../lib/f1-api/laps';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LapChartProps {
    sessionKey: number;
    width?: number;
    height?: number;
}

interface Driver {
    driver_number: number;
    full_name: string;
    team_name: string;
    team_color: string;
}

interface Lap {
    lap_number: number;
    driver_number: number;
    date_start: string;
    lap_duration: number | null;
    duration_sector_1: number | null;
    duration_sector_2: number | null;
    duration_sector_3: number | null;
    i1_speed: number | null;
    i2_speed: number | null;
    st_speed: number | null;
    is_pit_out_lap: boolean;
    segments_sector_1?: number[];
    segments_sector_2?: number[];
    segments_sector_3?: number[];
    date_formatted?: string;
    avg_sector_time?: number;
    valid_sectors?: number;
    completion_status?: string;
    driver_name?: string;
    team_color?: string;
}

const LapChart: React.FC<LapChartProps> = ({ sessionKey }) => {
    const [lapData, setLapData] = useState<Lap[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLap, setSelectedLap] = useState<Lap | null>(null);
    const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
    const [showTable, setShowTable] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [driversRes, lapsRes] = await Promise.all([
                    getDriversForSession(sessionKey),
                    getLapsForSession(sessionKey)
                ]);
                const driversData = driversRes.data;
                const laps = lapsRes.data;

                setDrivers(driversData);

                // Flatten laps for recharts
                const processed = laps.map((lap: Lap) => ({
                    ...lap,
                    date_formatted: new Date(lap.date_start).toLocaleTimeString(),
                    avg_sector_time: calculateAvgSectorTime(lap),
                    valid_sectors: countValidSectors(lap),
                    completion_status: getCompletionStatus(lap),
                    driver_name: driversData.find((d: Driver) => d.driver_number === lap.driver_number)?.full_name || lap.driver_number.toString(),
                    team_color: driversData.find((d: Driver) => d.driver_number === lap.driver_number)?.team_color || '#cccccc'
                }));

                setLapData(processed);

                // Select first driver by default
                if (driversData.length > 0) {
                    setSelectedDriver(driversData[0].driver_number);
                }

                const firstCompleteLap = processed.find(lap => lap.lap_duration !== null);
                if (firstCompleteLap) setSelectedLap(firstCompleteLap);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        if (sessionKey) fetchData();
    }, [sessionKey]);

    // Helper functions
    const calculateAvgSectorTime = (lap: Lap) => {
        const validSectors = [lap.duration_sector_1, lap.duration_sector_2, lap.duration_sector_3].filter((t): t is number => t !== null);
        if (validSectors.length === 0) return 0;
        return validSectors.reduce((sum, t) => sum + t, 0) / validSectors.length;
    };

    const countValidSectors = (lap: Lap) => [lap.duration_sector_1, lap.duration_sector_2, lap.duration_sector_3].filter((t): t is number => t !== null).length;

    const getCompletionStatus = (lap: Lap) => {
        if (lap.lap_duration !== null) return 'Complete';
        if (lap.is_pit_out_lap) return 'Pit Out';
        return 'Incomplete';
    };

    const getLapStatusBgColor = (status: string) => {
        switch (status) {
            case 'Complete': return 'bg-emerald-500'; // Emerald green
            case 'Pit Out': return 'bg-amber-500';  // Amber
            case 'Incomplete': return 'bg-red-500'; // Red
            default: return 'bg-gray-500';  // Gray
        }
    };

    const formatTime = (time: number | null) => time === null ? 'N/A' : time.toFixed(3) + 's';

    // Filter data for selected driver
    const selectedDriverData = selectedDriver
        ? lapData.filter(lap => lap.driver_number === selectedDriver)
        : lapData;

    const chartsData = selectedDriverData.filter(lap => lap.lap_duration !== null || lap.duration_sector_2 !== null);

    const handleLapSelect = (lap: Lap) => {
        setSelectedLap(lap);
        setViewMode('detail');
    };

    const handleBackToOverview = () => setViewMode('overview');

    const handleDriverSelect = (driverNumber: number) => {
        setSelectedDriver(driverNumber);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 bg-gray-900 bg-opacity-80 rounded-xl border border-gray-700">
            <div className="text-xl font-semibold text-gray-100 animate-pulse flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Lap Data...
            </div>
        </div>
    );

    return (
        <div className="w-full mt-12 mb-8 border-t border-gray-700 pt-8">
            <div className="bg-[#1E1E32] rounded-xl p-6 mb-4 transition-all duration-300 hover:shadow-lg border border-gray-800 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    LapAnalysis
                </h2>
                <p className="text-sm text-gray-300 mb-6">Detailed lap times and telemetry data from the current session</p>

                {/* Driver Selection */}
                <div className="mb-8 animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Select Driver
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {drivers.map((driver) => (
                            <button
                                key={driver.driver_number}
                                onClick={() => handleDriverSelect(driver.driver_number)}
                                className={`px-4 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 ${selectedDriver === driver.driver_number
                                    ? 'bg-gradient-to-r from-cyan-700 to-cyan-600 text-white shadow-lg shadow-cyan-900/30'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                    }`}
                                style={{
                                    borderLeft: `4px solid ${driver.team_color}`
                                }}
                            >
                                {driver.full_name}
                            </button>
                        ))}
                    </div>
                </div>

                {viewMode === 'overview' ? (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-[#283146] to-[#1e2434] p-4 rounded-lg shadow-lg border border-cyan-900/20 transition-all duration-300 hover:shadow-cyan-900/20 hover:translate-y-[-2px]">
                                <h3 className="text-sm font-medium text-cyan-300 mb-1">Total Laps</h3>
                                <p className="text-2xl font-bold text-white">{selectedDriverData.length}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#283146] to-[#1e2434] p-4 rounded-lg shadow-lg border border-emerald-900/20 transition-all duration-300 hover:shadow-emerald-900/20 hover:translate-y-[-2px]">
                                <h3 className="text-sm font-medium text-emerald-300 mb-1">Complete Laps</h3>
                                <p className="text-2xl font-bold text-white">{selectedDriverData.filter(lap => lap.lap_duration !== null).length}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#283146] to-[#1e2434] p-4 rounded-lg shadow-lg border border-amber-900/20 transition-all duration-300 hover:shadow-amber-900/20 hover:translate-y-[-2px]">
                                <h3 className="text-sm font-medium text-amber-300 mb-1">Pit Out Laps</h3>
                                <p className="text-2xl font-bold text-white">{selectedDriverData.filter(lap => lap.is_pit_out_lap).length}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#283146] to-[#1e2434] p-4 rounded-lg shadow-lg border border-fuchsia-900/20 transition-all duration-300 hover:shadow-fuchsia-900/20 hover:translate-y-[-2px]">
                                <h3 className="text-sm font-medium text-fuchsia-300 mb-1">Best Lap Time</h3>
                                <p className="text-2xl font-bold text-white">
                                    {selectedDriverData.filter(lap => lap.lap_duration !== null).length > 0
                                        ? Math.min(...selectedDriverData.filter(lap => lap.lap_duration !== null).map(lap => lap.lap_duration as number)).toFixed(3) + 's'
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Lap times chart */}
                            <div className="col-span-1 lg:col-span-2">
                                <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Lap Times
                                </h3>
                                <div className="h-64 bg-[#1A1A2E] p-4 rounded-lg border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-cyan-900/10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
                                            <XAxis dataKey="lap_number" stroke="#9CA3AF" />
                                            <YAxis domain={['auto', 'auto']} stroke="#9CA3AF" label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                                            <Tooltip
                                                formatter={(value: unknown) => [typeof value === 'number' ? `${Number(value).toFixed(3)}s` : 'N/A']}
                                                labelFormatter={value => `Lap ${value}`}
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
                                                animationDuration={300}
                                                itemStyle={{ color: '#F3F4F6' }}
                                                labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                                            />
                                            <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
                                            <Line
                                                type="monotone"
                                                dataKey="lap_duration"
                                                name="Lap Time"
                                                stroke={selectedDriver ? drivers.find(d => d.driver_number === selectedDriver)?.team_color || '#22D3EE' : '#22D3EE'}
                                                strokeWidth={3}
                                                activeDot={{ r: 8, strokeWidth: 2 }}
                                                connectNulls
                                                animationDuration={1000}
                                                animationEasing="ease-in-out"
                                                dot={{ fill: '#1A1A2E', strokeWidth: 2, r: 4, stroke: '#22D3EE' }}
                                            />
                                            <Line type="monotone" dataKey="duration_sector_1" name="Sector 1" stroke="#10B981" strokeWidth={2} connectNulls animationDuration={1000} dot={{ fill: '#1A1A2E', strokeWidth: 2, r: 3, stroke: '#10B981' }} />
                                            <Line type="monotone" dataKey="duration_sector_2" name="Sector 2" stroke="#F59E0B" strokeWidth={2} connectNulls animationDuration={1200} dot={{ fill: '#1A1A2E', strokeWidth: 2, r: 3, stroke: '#F59E0B' }} />
                                            <Line type="monotone" dataKey="duration_sector_3" name="Sector 3" stroke="#EF4444" strokeWidth={2} connectNulls animationDuration={1400} dot={{ fill: '#1A1A2E', strokeWidth: 2, r: 3, stroke: '#EF4444' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Speeds chart */}
                            <div className="col-span-1">
                                <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Speeds
                                </h3>
                                <div className="h-64 bg-[#1A1A2E] p-4 rounded-lg border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-rose-900/10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
                                            <XAxis dataKey="lap_number" stroke="#9CA3AF" />
                                            <YAxis domain={[0, 350]} stroke="#9CA3AF" label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                                            <Tooltip
                                                formatter={(value: unknown) => [typeof value === 'number' ? `${value} km/h` : 'N/A']}
                                                labelFormatter={value => `Lap ${value}`}
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
                                                animationDuration={300}
                                                itemStyle={{ color: '#F3F4F6' }}
                                                labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                                            />
                                            <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
                                            <Line type="monotone" dataKey="i1_speed" name="I1 Speed" stroke="#22D3EE" strokeWidth={2} connectNulls animationDuration={1000} dot={{ fill: '#1A1A2E', strokeWidth: 2, r: 3, stroke: '#22D3EE' }} />
                                            <Line type="monotone" dataKey="i2_speed" name="I2 Speed" stroke="#10B981" strokeWidth={2} connectNulls animationDuration={1200} dot={{ fill: '#1A1A2E', strokeWidth: 2, r: 3, stroke: '#10B981' }} />
                                            <Line type="monotone" dataKey="st_speed" name="ST Speed" stroke="#EF4444" strokeWidth={2} connectNulls animationDuration={1400} dot={{ fill: '#1A1A2E', strokeWidth: 2, r: 3, stroke: '#EF4444' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        {/* Table Toggle Button */}
                        <div className="flex justify-between items-center mt-8 mb-3">
                            <h3 className="text-lg font-semibold text-white flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Lap Details
                            </h3>
                            <button
                                onClick={() => setShowTable(!showTable)}
                                className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 transition-all duration-300 border border-gray-700 hover:border-gray-600 shadow-md"
                            >
                                {showTable ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        Hide Table
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                        Show Table
                                    </>
                                )}
                            </button>
                        </div>
                        {/* Lap list - Togglable */}
                        {showTable && (
                            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700 transition-all duration-300 animate-fadeIn">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-[#131325]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Lap</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">S1</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">S2</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">S3</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">I1 Speed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">I2 Speed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">ST Speed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[#1A1A2E] divide-y divide-gray-800">
                                        {selectedDriverData.map((lap, index) => (
                                            <tr
                                                key={lap.lap_number + '-' + lap.driver_number}
                                                className="hover:bg-[#232342] transition-colors duration-300"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{lap.lap_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLapStatusBgColor(lap.completion_status || 'Incomplete')} bg-opacity-20 text-${getLapStatusBgColor(lap.completion_status || 'Incomplete').replace('bg-', '')}`}>
                                                        {lap.completion_status || 'Incomplete'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatTime(lap.lap_duration)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatTime(lap.duration_sector_1)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatTime(lap.duration_sector_2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatTime(lap.duration_sector_3)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lap.i1_speed !== null ? `${lap.i1_speed} km/h` : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lap.i2_speed !== null ? `${lap.i2_speed} km/h` : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lap.st_speed !== null ? `${lap.st_speed} km/h` : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleLapSelect(lap)}
                                                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300 flex items-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (selectedLap && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Lap {selectedLap.lap_number} Details
                            </h2>
                            <button
                                onClick={handleBackToOverview}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 transition-all duration-300 flex items-center border border-gray-700 shadow-md hover:shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Overview
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
                                <h3 className="text-lg font-medium mb-4 flex items-center text-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Lap Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-cyan-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">Start Time</p>
                                        <p className="font-medium text-gray-200">{new Date(selectedLap.date_start).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-cyan-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">Lap Status</p>
                                        <p className="font-medium text-gray-200">
                                            <span className={`px-2 py-0.5 rounded-md text-sm ${getLapStatusBgColor(selectedLap.completion_status || 'Incomplete')} bg-opacity-20 text-${getLapStatusBgColor(selectedLap.completion_status || 'Incomplete').replace('bg-', '')}`}>
                                                {selectedLap.completion_status || 'Incomplete'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-cyan-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">Total Lap Time</p>
                                        <p className="font-medium text-gray-200">{formatTime(selectedLap.lap_duration)}</p>
                                    </div>
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-cyan-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">Pit Out Lap</p>
                                        <p className="font-medium text-gray-200">{selectedLap.is_pit_out_lap ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium mt-6 mb-4 flex items-center text-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Sector Times
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-emerald-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">Sector 1</p>
                                        <p className="font-medium text-gray-200">{formatTime(selectedLap.duration_sector_1)}</p>
                                    </div>
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-emerald-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">Sector 2</p>
                                        <p className="font-medium text-gray-200">{formatTime(selectedLap.duration_sector_2)}</p>
                                    </div>
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-emerald-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">Sector 3</p>
                                        <p className="font-medium text-gray-200">{formatTime(selectedLap.duration_sector_3)}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium mt-6 mb-4 flex items-center text-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Speed Data
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-rose-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">I1 Speed</p>
                                        <p className="font-medium text-gray-200">{selectedLap.i1_speed !== null ? `${selectedLap.i1_speed} km/h` : 'N/A'}</p>
                                    </div>
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-rose-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">I2 Speed</p>
                                        <p className="font-medium text-gray-200">{selectedLap.i2_speed !== null ? `${selectedLap.i2_speed} km/h` : 'N/A'}</p>
                                    </div>
                                    <div className="bg-[#1A1A2E] p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:shadow-rose-900/10 hover:translate-y-[-2px]">
                                        <p className="text-sm text-gray-400 mb-1">ST Speed</p>
                                        <p className="font-medium text-gray-200">{selectedLap.st_speed !== null ? `${selectedLap.st_speed} km/h` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="animate-fadeIn" style={{ animationDelay: "200ms" }}>
                                <h3 className="text-lg font-medium mb-4 flex items-center text-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Segment Data
                                </h3>
                                {/* Sector 1 Segments */}
                                <div className="mb-5">
                                    <h4 className="text-md font-medium mb-2 text-cyan-300">Sector 1 Segments</h4>
                                    <div className="h-32 bg-[#1A1A2E] p-3 rounded-lg border border-gray-700 shadow-md transition-all duration-300 hover:shadow-cyan-900/10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={selectedLap.segments_sector_1?.map((value: number, index: number) => ({ name: `S1-${index + 1}`, value: value === null ? 0 : value }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#374151" />
                                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                                <YAxis domain={[0, 3000]} stroke="#9CA3AF" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
                                                    formatter={(value: unknown) => [typeof value === 'number' && value !== 0 ? `${(value / 1000).toFixed(3)}s` : 'N/A']}
                                                    itemStyle={{ color: '#F3F4F6' }}
                                                    labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    fill="#22D3EE"
                                                    animationDuration={1200}
                                                    animationBegin={300}
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                {/* Sector 2 Segments */}
                                <div className="mb-5">
                                    <h4 className="text-md font-medium mb-2 text-emerald-300">Sector 2 Segments</h4>
                                    <div className="h-32 bg-[#1A1A2E] p-3 rounded-lg border border-gray-700 shadow-md transition-all duration-300 hover:shadow-emerald-900/10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={selectedLap.segments_sector_2?.map((value: number, index: number) => ({ name: `S2-${index + 1}`, value: value === null ? 0 : value }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#374151" />
                                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                                <YAxis domain={[0, 3000]} stroke="#9CA3AF" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
                                                    formatter={(value: unknown) => [typeof value === 'number' && value !== 0 ? `${(value / 1000).toFixed(3)}s` : 'N/A']}
                                                    itemStyle={{ color: '#F3F4F6' }}
                                                    labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    fill="#10B981"
                                                    animationDuration={1200}
                                                    animationBegin={600}
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                {/* Sector 3 Segments */}
                                <div>
                                    <h4 className="text-md font-medium mb-2 text-rose-300">Sector 3 Segments</h4>
                                    <div className="h-32 bg-[#1A1A2E] p-3 rounded-lg border border-gray-700 shadow-md transition-all duration-300 hover:shadow-rose-900/10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={selectedLap.segments_sector_3?.map((value: number, index: number) => ({ name: `S3-${index + 1}`, value: value === null ? 0 : value }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#374151" />
                                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                                <YAxis domain={[0, 3000]} stroke="#9CA3AF" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
                                                    formatter={(value: unknown) => [typeof value === 'number' && value !== 0 ? `${(value / 1000).toFixed(3)}s` : 'N/A']}
                                                    itemStyle={{ color: '#F3F4F6' }}
                                                    labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    fill="#EF4444"
                                                    animationDuration={1200}
                                                    animationBegin={900}
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LapChart;
