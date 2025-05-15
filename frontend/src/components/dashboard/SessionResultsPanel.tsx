import React from 'react';
import { SessionResult } from '@/lib/f1-api';

interface SessionResultsPanelProps {
    sessionResults: SessionResult[];
    isLoadingResults: boolean;
}

const SessionResultsPanel: React.FC<SessionResultsPanelProps> = ({
    sessionResults,
    isLoadingResults
}) => {
    return (
        <div className="rounded-xl border border-[#FF9A4A]/30 bg-gradient-to-br from-[#4A2A1A] to-[#6A3A2A] h-[660px] p-0 flex flex-col shadow-lg shadow-orange-900/20">
            <div className="rounded-t-xl bg-[#8A4A2A] text-white text-base font-bold px-4 py-2">Session Results</div>
            {isLoadingResults ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF9A4A]"></div>
                </div>
            ) : sessionResults.length > 0 ? (
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[#4A2A1A] scrollbar-thumb-[#FF9A4A]/60 hover:scrollbar-thumb-[#FF9A4A]/80">
                    <div className="p-4">
                        {sessionResults.map((result, index) => (
                            <div key={result.driver.driverId} className={`flex items-center justify-between py-2 border-b border-[#7A5A3A]/30 last:border-0 ${index === 0 ? 'bg-[#FFD700]/10' :
                                index === 1 ? 'bg-[#C0C0C0]/10' :
                                    index === 2 ? 'bg-[#CD7F32]/10' :
                                        index % 2 === 0 ? 'bg-[#6A3A2A]/50' : ''
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 font-bold ${index === 0 ? 'text-[#FFD700]' :
                                        index === 1 ? 'text-[#C0C0C0]' :
                                            index === 2 ? 'text-[#CD7F32]' :
                                                'text-gray-400'
                                        }`}>P{result.position}</span>
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${index === 0 ? 'bg-[#FFD700]/30' :
                                        index === 1 ? 'bg-[#C0C0C0]/30' :
                                            index === 2 ? 'bg-[#CD7F32]/30' :
                                                'bg-[#7A5A3A]'
                                        }`}>
                                        <span className="text-xs text-white">{result.driver.shortName}</span>
                                    </div>
                                    <span className="text-white">{result.driver.surname}</span>
                                </div>
                                <span className="text-gray-400">{result.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">No data available</div>
            )}
        </div>
    );
};

export default SessionResultsPanel;
