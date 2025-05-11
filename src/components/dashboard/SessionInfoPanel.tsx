import React from 'react';
import { SessionResult } from '@/lib/f1-api';

interface SessionInfoPanelProps {
    selectedTrack: string;
    selectedSession: string;
    sessionResults: SessionResult[];
    isLoadingResults: boolean;
}

const SessionInfoPanel: React.FC<SessionInfoPanelProps> = ({
    selectedTrack,
    selectedSession,
    sessionResults,
    isLoadingResults
}) => {
    return (
        <div className="rounded-xl border border-[#FF4A4A]/30 bg-gradient-to-br from-[#9A1A1A] to-[#C72C2C] w-full h-40 flex flex-col shadow-lg shadow-red-900/20">
            <div className="rounded-t-xl bg-[#B71C1C] text-white text-lg font-bold px-4 py-2">
                {selectedTrack && selectedSession ? `${selectedTrack.toUpperCase()} - ${selectedSession.toUpperCase()}` : 'Select Session'}
            </div>
            {isLoadingResults ? (
                <div className="flex-1 flex items-center justify-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
            ) : sessionResults.length > 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="text-white text-2xl font-bold mb-2">Session Results</div>
                    <div className="text-white/80 text-lg">
                        {sessionResults.length} Drivers Completed
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-white">No data available</div>
            )}
        </div>
    );
};

export default SessionInfoPanel;
