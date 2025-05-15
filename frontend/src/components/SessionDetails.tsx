import React, { useState } from 'react';
import { Session } from '../lib/f1-api';
import LapChart from './LapChart';

interface SessionDetailsProps {
    session: Session;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ session }) => {
    const [showLapChart, setShowLapChart] = useState<boolean>(true);

    // Format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Format time for display
    const formatTime = (timeStr: string) => {
        if (!timeStr) return 'N/A';
        return timeStr.replace('Z', '').replace(/:\d{2}$/, '');
    };

    return (
        <div className="session-details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#232333]/60 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-200 mb-2">Session Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-400">Type:</div>
                        <div className="font-medium">{session.type.toUpperCase()}</div>
                        <div className="text-gray-400">Date:</div>
                        <div className="font-medium">{formatDate(session.date)}</div>
                        <div className="text-gray-400">Time:</div>
                        <div className="font-medium">{formatTime(session.time)}</div>
                        <div className="text-gray-400">Status:</div>
                        <div className="font-medium">{session.status}</div>
                    </div>
                </div>

                <div className="bg-[#232333]/60 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-200 mb-2">Session Analysis</h3>
                    <p className="text-sm mb-4">
                        View detailed lap time analysis for this session.
                    </p>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowLapChart(!showLapChart)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            {showLapChart ? 'Hide Lap Chart' : 'Show Lap Chart'}
                        </button>
                        {session.session_key ? (
                            <span className="text-xs text-gray-400">Session Key: {session.session_key}</span>
                        ) : (
                            <span className="text-xs text-red-400">No session key available</span>
                        )}
                    </div>
                </div>
            </div>

            {showLapChart && session.session_key ? (
                <div className="bg-[#1E1E2E]/80 border border-gray-700 rounded-lg p-4 overflow-hidden">
                    <h3 className="text-lg font-semibold text-blue-200 mb-4">Lap Time Analysis</h3>
                    <LapChart
                        sessionKey={session.session_key}
                        width={Math.min(window.innerWidth - 100, 1200)}
                        height={500}
                    />
                </div>
            ) : showLapChart ? (
                <div className="bg-[#1E1E2E]/80 border border-gray-700 rounded-lg p-8 text-center">
                    <p className="text-yellow-400">
                        Lap chart is not available for this session. No session key was found.
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default SessionDetails;
