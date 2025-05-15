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
    };    return (
        <div className="session-details w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#1A1A2E] p-5 rounded-lg border border-gray-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-3">Session Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-gray-400">Type:</div>
                        <div className="font-medium text-gray-200">{session.type.toUpperCase()}</div>
                        <div className="text-gray-400">Date:</div>
                        <div className="font-medium text-gray-200">{formatDate(session.date)}</div>
                        <div className="text-gray-400">Time:</div>
                        <div className="font-medium text-gray-200">{formatTime(session.time)}</div>
                        <div className="text-gray-400">Status:</div>
                        <div className="font-medium text-gray-200">{session.status}</div>
                    </div>
                </div>

                <div className="bg-[#1A1A2E] p-5 rounded-lg border border-gray-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-3">Session Analysis</h3>
                    <p className="text-sm mb-4 text-gray-300">
                        View detailed lap time analysis for this session.
                    </p>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowLapChart(!showLapChart)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-700 to-cyan-600 text-white rounded hover:shadow-lg hover:from-cyan-600 hover:to-cyan-500 transition-all duration-300 shadow"
                        >
                            {showLapChart ? 'Hide Lap Chart' : 'Show Lap Chart'}
                        </button>                        {session.session_key ? (
                            <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">Session Key: {session.session_key}</span>
                        ) : (
                            <span className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded-full">No session key available</span>
                        )}
                    </div>
                </div>
            </div>

            {showLapChart && session.session_key ? (
                <div className="bg-[#1E1E32] border border-gray-700 rounded-lg p-6 overflow-hidden shadow-xl">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-4">Lap Time Analysis</h3>
                    <LapChart
                        sessionKey={session.session_key}
                        width={Math.min(window.innerWidth - 100, 1200)}
                        height={500}
                    />
                </div>
            ) : showLapChart ? (
                <div className="bg-[#1E1E32] border border-gray-700 rounded-lg p-8 text-center shadow-lg">
                    <p className="text-amber-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Lap chart is not available for this session. No session key was found.
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default SessionDetails;
