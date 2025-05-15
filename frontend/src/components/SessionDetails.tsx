import React from 'react';
import { Session } from '../lib/f1-api/types';
import LapChart from './LapChart';

interface SessionDetailsProps {
    session: Session;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ session }) => {
    return (
        <div className="session-details bg-[#1E1E2E]/80 border border-gray-700 shadow rounded-lg p-4">
            <div className="mb-6">
                <h2 className="text-xl font-bold capitalize text-blue-300">{session.type}</h2>
                <p className="text-sm text-gray-300">
                    Date: {session.date} | Time: {session.time} | Status: <span className="capitalize">{session.status}</span>
                </p>
                {session.session_key ? (
                    <p className="text-sm bg-blue-900/50 border border-blue-700 rounded p-2 mt-2">
                        Session Key: {session.session_key}
                    </p>
                ) : (
                    <p className="text-sm text-orange-400 mt-2">
                        No session key available
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#252538]/80 border border-gray-700 rounded-lg">
                    <h3 className="font-medium text-blue-300 mb-1">Session Type</h3>
                    <p className="capitalize text-white">{session.type}</p>
                </div>

                <div className="p-3 bg-[#252538]/80 border border-gray-700 rounded-lg">
                    <h3 className="font-medium text-blue-300 mb-1">Status</h3>
                    <p className="capitalize text-white">{session.status}</p>
                </div>
            </div>

            {session.session_key ? (
                <div className="mt-4">
                    <h3 className="text-lg font-bold text-green-300 mb-2">Telemetry Data Available</h3>
                    <LapChart sessionKey={session.session_key} />
                </div>
            ) : (
                <div className="mt-4 p-4 bg-[#252538]/80 border border-gray-700 rounded-lg text-center">
                    <p className="text-yellow-400">Telemetry data unavailable for this session</p>
                </div>
            )}
        </div>
    );
};

export default SessionDetails;
