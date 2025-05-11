import React from 'react';
import { ConstructorChampionship } from '@/lib/f1-api';

interface ConstructorStandingsPanelProps {
    constructorStandings: ConstructorChampionship[];
    isLoadingConstructorStandings: boolean;
    selectedSeason: string;
}

const ConstructorStandingsPanel: React.FC<ConstructorStandingsPanelProps> = ({
    constructorStandings,
    isLoadingConstructorStandings,
    selectedSeason
}) => {
    return (
        <div className="rounded-xl border border-[#4AFF4A]/30 bg-gradient-to-br from-[#1A4A1A] to-[#2A6A2A] min-h-[200px] p-0 flex flex-col shadow-lg shadow-green-900/20">
            <div className="rounded-t-xl bg-[#2A8A2A] text-white text-base font-bold px-4 py-2">
                {selectedSeason ? `${selectedSeason} Constructor Standings` : 'Constructor Standings'}
            </div>
            {isLoadingConstructorStandings ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4AFF4A]"></div>
                </div>
            ) : constructorStandings.length > 0 ? (
                <div className="flex-1 p-4">
                    {constructorStandings.slice(0, 10).map((constructor, index) => (
                        <div
                            key={constructor.id}
                            className={`flex items-center justify-between py-2 border-b border-[#3A7A3A]/30 last:border-0 ${index === 0 ? 'bg-[#FFD700]/10' :
                                index === 1 ? 'bg-[#C0C0C0]/10' :
                                    index === 2 ? 'bg-[#CD7F32]/10' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-6 font-bold ${index === 0 ? 'text-[#FFD700]' :
                                    index === 1 ? 'text-[#C0C0C0]' :
                                        index === 2 ? 'text-[#CD7F32]' : 'text-gray-400'
                                    }`}>P{constructor.position}</span>
                                <div
                                    className="h-6 w-6 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: constructor.color }}
                                >
                                    <span className="text-xs text-white">{constructor.id.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <span className="text-white">{constructor.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">{constructor.points} pts</span>
                                {constructor.wins > 0 && (
                                    <span className="text-yellow-500 text-xs">({constructor.wins}W)</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">No data available</div>
            )}
        </div>
    );
};

export default ConstructorStandingsPanel;
