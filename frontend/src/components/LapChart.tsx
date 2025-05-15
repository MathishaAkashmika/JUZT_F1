import React, { useEffect, useState } from 'react';
import { getLapChartData, LapData } from '../lib/f1-api/telemetry';

interface LapChartProps {
    sessionKey: number | null;
}

const LapChart: React.FC<LapChartProps> = ({ sessionKey }) => {
    const [lapData, setLapData] = useState<LapData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!sessionKey) {
                setError('No session key provided');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const result = await getLapChartData(sessionKey);
                if (result.error) {
                    setError(result.error.message);
                } else {
                    setLapData(result.data);
                }
            } catch (err) {
                setError('Failed to fetch lap data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionKey]);

    if (!sessionKey) {
        return <div className="flex justify-center items-center p-8">Select a session to view lap data</div>;
    }

    if (loading) {
        return <div className="flex justify-center items-center p-8">Loading lap data...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    if (lapData.length === 0) {
        return <div className="p-4">No lap data available for this session</div>;
    }

    return (
        <div className="lap-chart-container p-4 border rounded-lg bg-white shadow">
            <h2 className="text-xl font-bold mb-4">Lap Chart (Session: {sessionKey})</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Driver
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lap
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Compound
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {lapData.map((lap, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {lap.driver_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {lap.lap_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatLapTime(lap.lap_time)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {lap.position}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {lap.compound || 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Helper function to format lap time in MM:SS.mmm format
const formatLapTime = (time: number): string => {
    if (!time) return 'N/A';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.round((time - Math.floor(time)) * 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

export default LapChart;
