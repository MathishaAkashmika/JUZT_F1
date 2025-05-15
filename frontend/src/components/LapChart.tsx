import React, { useEffect, useState } from 'react';
import { getDriversForSession, getLapsForSession } from '../lib/f1-api/laps';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LapChartProps {
    sessionKey: number;
}

interface Driver {
    driver_number: number;
    full_name: string;
    team_name: string;
    team_color: string;
}

const LapChart: React.FC<LapChartProps> = ({ sessionKey }) => {
    const [lapData, setLapData] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLap, setSelectedLap] = useState<any | null>(null);
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
                const processed = laps.map((lap: any) => ({
                    ...lap,
                    date_formatted: new Date(lap.date_start).toLocaleTimeString(),
                    avg_sector_time: calculateAvgSectorTime(lap),
                    valid_sectors: countValidSectors(lap),
                    completion_status: getCompletionStatus(lap),
                    driver_name: driversData.find((d: Driver) => d.driver_number === lap.driver_number)?.full_name || lap.driver_number,
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
    const calculateAvgSectorTime = (lap: any) => {
        const validSectors = [lap.duration_sector_1, lap.duration_sector_2, lap.duration_sector_3].filter((t: any) => t !== null);
        if (validSectors.length === 0) return 0;
        return validSectors.reduce((sum: number, t: number) => sum + t, 0) / validSectors.length;
    };

    const countValidSectors = (lap: any) => [lap.duration_sector_1, lap.duration_sector_2, lap.duration_sector_3].filter((t: any) => t !== null).length;

    const getCompletionStatus = (lap: any) => {
        if (lap.lap_duration !== null) return 'Complete';
        if (lap.is_pit_out_lap) return 'Pit Out';
        return 'Incomplete';
    };

    const getLapStatusColor = (status: string) => {
        switch (status) {
            case 'Complete': return '#4CAF50';
            case 'Pit Out': return '#FFC107';
            case 'Incomplete': return '#FF5722';
            default: return '#9E9E9E';
        }
    };

    const formatTime = (time: number | null) => time === null ? 'N/A' : time.toFixed(3) + 's';

    // Filter data for selected driver
    const selectedDriverData = selectedDriver
        ? lapData.filter(lap => lap.driver_number === selectedDriver)
        : lapData;

    const chartsData = selectedDriverData.filter(lap => lap.lap_duration !== null || lap.duration_sector_2 !== null);

    const handleLapSelect = (lap: any) => {
        setSelectedLap(lap);
        setViewMode('detail');
    };

    const handleBackToOverview = () => setViewMode('overview');

    const handleDriverSelect = (driverNumber: number) => {
        setSelectedDriver(driverNumber);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="text-xl font-semibold text-gray-700">Loading Lap Data...</div></div>;

    return (
        <div className="w-full mt-12 mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Lap Analysis</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Detailed lap times and telemetry data from the current session</p>

                {/* Driver Selection */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Select Driver</h3>
                    <div className="flex flex-wrap gap-2">
                        {drivers.map((driver) => (
                            <button
                                key={driver.driver_number}
                                onClick={() => handleDriverSelect(driver.driver_number)}
                                className={`px-3 py-1 rounded transition-colors ${selectedDriver === driver.driver_number
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}
                                style={{
                                    borderLeft: `3px solid ${driver.team_color}`
                                }}
                            >
                                {driver.full_name}
                            </button>
                        ))}
                    </div>
                </div>

                {viewMode === 'overview' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Laps</h3>
                                <p className="text-2xl font-bold">{selectedDriverData.length}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded">
                                <h3 className="text-sm font-medium text-green-700 dark:text-green-300">Complete Laps</h3>
                                <p className="text-2xl font-bold">{selectedDriverData.filter(lap => lap.lap_duration !== null).length}</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded">
                                <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pit Out Laps</h3>
                                <p className="text-2xl font-bold">{selectedDriverData.filter(lap => lap.is_pit_out_lap).length}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded">
                                <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">Best Lap Time</h3>
                                <p className="text-2xl font-bold">
                                    {selectedDriverData.filter(lap => lap.lap_duration !== null).length > 0
                                        ? Math.min(...selectedDriverData.filter(lap => lap.lap_duration !== null).map(lap => lap.lap_duration)).toFixed(3) + 's'
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Lap times chart */}
                            <div className="col-span-1 lg:col-span-2">
                                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Lap Times</h3>
                                <div className="h-64 bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="lap_number" stroke="#6B7280" />
                                            <YAxis domain={['auto', 'auto']} stroke="#6B7280" label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }} />
                                            <Tooltip
                                                formatter={(value: any) => [value !== null ? `${Number(value).toFixed(3)}s` : 'N/A']}
                                                labelFormatter={value => `Lap ${value}`}
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F9FAFB' }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="lap_duration"
                                                name="Lap Time"
                                                stroke={selectedDriver ? drivers.find(d => d.driver_number === selectedDriver)?.team_color || '#8884d8' : '#8884d8'}
                                                activeDot={{ r: 8 }}
                                                connectNulls
                                            />
                                            <Line type="monotone" dataKey="duration_sector_1" name="Sector 1" stroke="#82ca9d" connectNulls />
                                            <Line type="monotone" dataKey="duration_sector_2" name="Sector 2" stroke="#ffc658" connectNulls />
                                            <Line type="monotone" dataKey="duration_sector_3" name="Sector 3" stroke="#ff8042" connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Speeds chart */}
                            <div className="col-span-1">
                                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Speeds</h3>
                                <div className="h-64 bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="lap_number" stroke="#6B7280" />
                                            <YAxis domain={[0, 350]} stroke="#6B7280" label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }} />
                                            <Tooltip
                                                formatter={(value: any) => [value !== null ? `${value} km/h` : 'N/A']}
                                                labelFormatter={value => `Lap ${value}`}
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F9FAFB' }}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="i1_speed" name="I1 Speed" stroke="#8884d8" connectNulls />
                                            <Line type="monotone" dataKey="i2_speed" name="I2 Speed" stroke="#82ca9d" connectNulls />
                                            <Line type="monotone" dataKey="st_speed" name="ST Speed" stroke="#ff8042" connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Table Toggle Button */}
                        <div className="flex justify-between items-center mt-6 mb-2">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Lap Details</h3>
                            <button
                                onClick={() => setShowTable(!showTable)}
                                className="flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                            >
                                {showTable ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        Hide Table
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                        Show Table
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Lap list - Togglable */}
                        {showTable && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lap</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S1</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S2</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S3</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">I1 Speed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">I2 Speed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ST Speed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedDriverData.map((lap) => (
                                            <tr key={lap.lap_number + '-' + lap.driver_number} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lap.lap_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                                        style={{ backgroundColor: `${getLapStatusColor(lap.completion_status)}20`, color: getLapStatusColor(lap.completion_status) }}>
                                                        {lap.completion_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatTime(lap.lap_duration)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatTime(lap.duration_sector_1)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatTime(lap.duration_sector_2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatTime(lap.duration_sector_3)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lap.i1_speed !== null ? `${lap.i1_speed} km/h` : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lap.i2_speed !== null ? `${lap.i2_speed} km/h` : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lap.st_speed !== null ? `${lap.st_speed} km/h` : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    <button onClick={() => handleLapSelect(lap)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">Details</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    selectedLap && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Lap {selectedLap.lap_number} Details</h2>
                                <button onClick={handleBackToOverview} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors">Back to Overview</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Lap Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Start Time</p>
                                            <p className="font-medium">{new Date(selectedLap.date_start).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Lap Status</p>
                                            <p className="font-medium">{selectedLap.completion_status}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Total Lap Time</p>
                                            <p className="font-medium">{formatTime(selectedLap.lap_duration)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Pit Out Lap</p>
                                            <p className="font-medium">{selectedLap.is_pit_out_lap ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium mt-6 mb-3">Sector Times</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Sector 1</p>
                                            <p className="font-medium">{formatTime(selectedLap.duration_sector_1)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Sector 2</p>
                                            <p className="font-medium">{formatTime(selectedLap.duration_sector_2)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Sector 3</p>
                                            <p className="font-medium">{formatTime(selectedLap.duration_sector_3)}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium mt-6 mb-3">Speed Data</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">I1 Speed</p>
                                            <p className="font-medium">{selectedLap.i1_speed !== null ? `${selectedLap.i1_speed} km/h` : 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">I2 Speed</p>
                                            <p className="font-medium">{selectedLap.i2_speed !== null ? `${selectedLap.i2_speed} km/h` : 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">ST Speed</p>
                                            <p className="font-medium">{selectedLap.st_speed !== null ? `${selectedLap.st_speed} km/h` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Segment Data</h3>
                                    {/* Sector 1 Segments */}
                                    <div className="mb-4">
                                        <h4 className="text-md font-medium mb-2">Sector 1 Segments</h4>
                                        <div className="h-32">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={selectedLap.segments_sector_1?.map((value: number, index: number) => ({ name: `S1-${index + 1}`, value: value === null ? 0 : value }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis domain={[0, 3000]} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#8884d8" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    {/* Sector 2 Segments */}
                                    <div className="mb-4">
                                        <h4 className="text-md font-medium mb-2">Sector 2 Segments</h4>
                                        <div className="h-32">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={selectedLap.segments_sector_2?.map((value: number, index: number) => ({ name: `S2-${index + 1}`, value: value === null ? 0 : value }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis domain={[0, 3000]} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#82ca9d" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    {/* Sector 3 Segments */}
                                    <div>
                                        <h4 className="text-md font-medium mb-2">Sector 3 Segments</h4>
                                        <div className="h-32">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={selectedLap.segments_sector_3?.map((value: number, index: number) => ({ name: `S3-${index + 1}`, value: value === null ? 0 : value }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis domain={[0, 3000]} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#ff8042" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default LapChart;
