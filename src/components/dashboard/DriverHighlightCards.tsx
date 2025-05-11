import React from 'react';
import { SessionResult } from '@/lib/f1-api';

interface DriverHighlightCardsProps {
    sessionResults: SessionResult[];
    isLoadingResults: boolean;
    selectedDriver: number;
    setSelectedDriver: (index: number) => void;
}

const DriverHighlightCards: React.FC<DriverHighlightCardsProps> = ({
    sessionResults,
    isLoadingResults,
    selectedDriver,
    setSelectedDriver
}) => {
    return (
        <div className="grid grid-cols-3 gap-6 w-full mb-4">
            {isLoadingResults ? (
                <div className="col-span-3 text-center text-gray-400 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6A5ACD] mx-auto mb-2"></div>
                    Loading results...
                </div>
            ) : sessionResults.length > 0 ? (
                sessionResults.slice(0, 3).map((result, idx) => (
                    <div
                        key={result.driver.driverId}
                        className={`relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] 
                        ${selectedDriver === idx ? 'ring-4 transform scale-[1.01] shadow-lg' : 'shadow'} 
                        ${idx === 0 ? 'ring-[#FFD700] shadow-[#FFD700]/20' :
                                idx === 1 ? 'ring-[#C0C0C0] shadow-[#C0C0C0]/20' :
                                    'ring-[#CD7F32] shadow-[#CD7F32]/20'}`}
                        onClick={() => setSelectedDriver(idx)}
                    >
                        {/* Background gradient with position-based color */}
                        <div className={`absolute inset-0 
                            ${idx === 0 ? 'bg-gradient-to-br from-[#FFD700]/30 to-[#5A4A2A]/80' :
                                idx === 1 ? 'bg-gradient-to-br from-[#C0C0C0]/30 to-[#4A4A5A]/80' :
                                    'bg-gradient-to-br from-[#CD7F32]/30 to-[#5A3A2A]/80'}`}
                        />

                        {/* Position indicator */}
                        <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center 
                            ${idx === 0 ? 'bg-[#FFD700] text-black' :
                                idx === 1 ? 'bg-[#C0C0C0] text-black' :
                                    'bg-[#CD7F32] text-white'} font-bold text-lg z-20`}>
                            P{idx + 1}
                        </div>

                        {/* Driver Image Background */}
                        {result.driver.imageUrl && (
                            <div className="absolute right-0 top-0 h-full w-2/3 opacity-40" style={{ zIndex: 1 }}>
                                <img
                                    src={result.driver.imageUrl}
                                    alt={result.driver.surname}
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        )}

                        {/* Dark overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" style={{ zIndex: 2 }} />

                        {/* Content */}
                        <div className="relative flex flex-row justify-between items-center h-[130px] w-full z-10 p-4">
                            <div className="flex flex-col justify-center h-full py-2 pl-8">
                                <div className="flex flex-col gap-1 mt-1">
                                    <div className="font-bold text-xl text-white">{result.driver.surname}</div>
                                    <div className="text-sm text-gray-300">{result.team.teamName}</div>
                                    <div className={`mt-2 px-3 py-1 rounded-md inline-block w-max 
                                        ${idx === 0 ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                                            idx === 1 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                                                'bg-[#CD7F32]/20 text-[#CD7F32]'}`}>
                                        {result.time}
                                    </div>
                                </div>
                            </div>

                            <div className={`h-20 w-20 rounded-lg overflow-hidden border-2 ml-auto mr-2
                                ${idx === 0 ? 'border-[#FFD700] shadow-md shadow-[#FFD700]/30' :
                                    idx === 1 ? 'border-[#C0C0C0] shadow-md shadow-[#C0C0C0]/30' :
                                        'border-[#CD7F32] shadow-md shadow-[#CD7F32]/30'} 
                                flex items-center justify-center`}>
                                {result.driver.imageUrl ? (
                                    <img
                                        src={result.driver.imageUrl}
                                        alt={result.driver.shortName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className={`h-full w-full flex items-center justify-center
                                        ${idx === 0 ? 'bg-[#FFD700]/20' :
                                            idx === 1 ? 'bg-[#C0C0C0]/20' :
                                                'bg-[#CD7F32]/20'}`}>
                                        <span className="text-white text-xl font-bold">{result.driver.shortName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-3 text-center text-gray-400 py-8 rounded-xl border border-neutral-800 bg-neutral-900/50">
                    No session results available. Please select a year, track, and session.
                </div>
            )}
        </div>
    );
};

export default DriverHighlightCards;
