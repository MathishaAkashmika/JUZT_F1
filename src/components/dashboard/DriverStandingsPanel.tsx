import React from 'react';
import { Driver } from '@/lib/f1-api';

interface DriverStandingsPanelProps {
    driverStandings: Driver[];
    isLoadingDriverStandings: boolean;
    selectedSeason: string;
}

const DriverStandingsPanel: React.FC<DriverStandingsPanelProps> = ({
    driverStandings,
    isLoadingDriverStandings,
    selectedSeason
}) => {
    return (
        <div className="rounded-xl border border-[#4A90FF]/30 bg-gradient-to-br from-[#1A2A4A] to-[#2A3A6A] min-h-[200px] p-0 flex flex-col shadow-lg shadow-blue-900/20">
            <div className="rounded-t-xl bg-[#2A4A8A] text-white text-base font-bold px-4 py-2">
                {selectedSeason} Championship Standings
            </div>
            {isLoadingDriverStandings ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4A90FF]"></div>
                </div>
            ) : driverStandings.length > 0 ? (
                <div className="flex-1 p-4">
                    {driverStandings.slice(0, 10).map((driver, index) => (
                        <div key={driver.driverId} className={`flex items-center justify-between py-2 border-b border-[#3A4A7A]/30 last:border-0 ${index === 0 ? 'bg-[#FFD700]/10' :
                            index === 1 ? 'bg-[#C0C0C0]/10' :
                                index === 2 ? 'bg-[#CD7F32]/10' : ''
                            }`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-6 font-bold ${index === 0 ? 'text-[#FFD700]' :
                                    index === 1 ? 'text-[#C0C0C0]' :
                                        index === 2 ? 'text-[#CD7F32]' :
                                            'text-gray-400'
                                    }`}>P{driver.position}</span>
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${index === 0 ? 'bg-[#FFD700]/30' :
                                    index === 1 ? 'bg-[#C0C0C0]/30' :
                                        index === 2 ? 'bg-[#CD7F32]/30' :
                                            'bg-[#3A4A7A]'
                                    }`}>
                                    <span className="text-xs text-white">{driver.shortName?.substring(0, 2) || driver.driverId.substring(0, 2)}</span>
                                </div>
                                <span className="text-white">{driver.surname}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">{driver.points} pts</span>
                                {driver.wins !== undefined && driver.wins > 0 && (
                                    <span className="text-yellow-500 text-xs">({driver.wins}W)</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    No championship data available
                </div>
            )}
        </div>
    );
};

export default DriverStandingsPanel;
