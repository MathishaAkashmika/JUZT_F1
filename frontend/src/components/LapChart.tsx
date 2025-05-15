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

    if (loading) return <div className="flex items-center justify-center h-96"><div className="text-2xl font-semibold text-gray-700">Loading Lap Data...</div></div>;

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Lap Data Chart</h1>
                <div className="text-gray-600 mt-2">
                    <p>Session: {lapData[0]?.session_key} | Meeting: {lapData[0]?.meeting_key}</p>
                </div>
            </header>

            {/* Driver Selection */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Select Driver</h2>
                <div className="flex flex-wrap gap-4">
                    {drivers.map((driver) => (
                        <button
                            key={driver.driver_number}
                            onClick={() => handleDriverSelect(driver.driver_number)}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedDriver === driver.driver_number
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-3">
                        <h2 className="text-xl font-semibold mb-4">Driver Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-700">Total Laps</h3>
                                <p className="text-2xl font-bold">{selectedDriverData.length}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-green-700">Complete Laps</h3>
                                <p className="text-2xl font-bold">{selectedDriverData.filter(lap => lap.lap_duration !== null).length}</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-yellow-700">Pit Out Laps</h3>
                                <p className="text-2xl font-bold">{selectedDriverData.filter(lap => lap.is_pit_out_lap).length}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-purple-700">Best Lap Time</h3>
                                <p className="text-2xl font-bold">
                                    {Math.min(...selectedDriverData.filter(lap => lap.lap_duration !== null).map(lap => lap.lap_duration)).toFixed(3)}s
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lap times chart */}
                    <div className="bg-white shadow-md rounded-lg p-6 col-span-1 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Lap Times</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="lap_number" />
                                    <YAxis domain={['auto', 'auto']} label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        formatter={(value: any) => [value !== null ? `${Number(value).toFixed(3)}s` : 'N/A']}
                                        labelFormatter={value => `Lap ${value}`}
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
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Speeds</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="lap_number" />
                                    <YAxis domain={[0, 350]} label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        formatter={(value: any) => [value !== null ? `${value} km/h` : 'N/A']}
                                        labelFormatter={value => `Lap ${value}`}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="i1_speed" name="I1 Speed" stroke="#8884d8" connectNulls />
                                    <Line type="monotone" dataKey="i2_speed" name="I2 Speed" stroke="#82ca9d" connectNulls />
                                    <Line type="monotone" dataKey="st_speed" name="ST Speed" stroke="#ff8042" connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Lap list */}
                    <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-3">
                        <h2 className="text-xl font-semibold mb-4">Lap Details</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lap</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S1</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S2</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S3</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">I1 Speed</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">I2 Speed</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ST Speed</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedDriverData.map((lap) => (
                                        <tr key={lap.lap_number + '-' + lap.driver_number} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lap.lap_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                                    style={{ backgroundColor: `${getLapStatusColor(lap.completion_status)}20`, color: getLapStatusColor(lap.completion_status) }}>
                                                    {lap.completion_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(lap.lap_duration)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(lap.duration_sector_1)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(lap.duration_sector_2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(lap.duration_sector_3)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lap.i1_speed !== null ? `${lap.i1_speed} km/h` : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lap.i2_speed !== null ? `${lap.i2_speed} km/h` : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lap.st_speed !== null ? `${lap.st_speed} km/h` : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button onClick={() => handleLapSelect(lap)} className="text-indigo-600 hover:text-indigo-900 font-medium">Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                selectedLap && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Lap {selectedLap.lap_number} Details</h2>
                            <button onClick={handleBackToOverview} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-medium transition-colors">Back to Overview</button>
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
            <footer className="mt-8 text-center text-gray-500 text-sm">
                <p>F1 Lap Data Chart | OpenF1 API</p>
            </footer>
        </div>
    );
};

export default LapChart;
