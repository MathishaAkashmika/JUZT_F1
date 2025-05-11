import React from 'react';
import { SessionResult } from '@/lib/f1-api';

interface FastestLapPanelProps {
    sessionResults: SessionResult[];
    isLoadingResults: boolean;
}

const FastestLapPanel: React.FC<FastestLapPanelProps> = ({ sessionResults, isLoadingResults }) => {
    return (
        <div className="rounded-xl border border-[#9A4AFF]/30 bg-gradient-to-br from-[#6A1B9A] to-[#9C27B0] w-full h-40 flex flex-col shadow-lg shadow-purple-900/20">
            <div className="rounded-t-xl bg-[#8E24AA] text-white text-xs font-bold px-4 py-2 tracking-widest">FASTEST LAP</div>
            {isLoadingResults ? (
                <div className="flex-1 flex items-center justify-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
            ) : sessionResults.length > 0 ? (
                <div className="flex-1 flex flex-col justify-center px-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-lg font-bold">{sessionResults[0].driver.surname}</span>
                        <span className="text-white text-lg">{sessionResults[0].time}</span>
                    </div>
                    <div className="text-white/80 text-sm">{sessionResults[0].team.teamName}</div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-white">No data available</div>
            )}
        </div>
    );
};

export default FastestLapPanel;
