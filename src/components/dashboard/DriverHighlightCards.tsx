import React from 'react';
import Image from 'next/image';
import { Driver } from '@/lib/f1-api';

interface DriverHighlightCardsProps {
    drivers: Driver[];
    isLoading: boolean;
}

const DriverHighlightCards: React.FC<DriverHighlightCardsProps> = ({ drivers, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-800 rounded-lg p-6 h-48"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
                <div key={driver.driverId} className="bg-gradient-to-br from-[#1A2A4A] to-[#2A3A6A] rounded-lg p-6 shadow-lg shadow-blue-900/20">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            <Image
                                src={driver.imageUrl || `/drivers/${driver.shortName?.toLowerCase() || driver.driverId}.png`}
                                alt={`${driver.name} ${driver.surname}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{driver.name} {driver.surname}</h3>
                            <p className="text-gray-400">{driver.team}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-gray-400">
                            <p>Number: {driver.number}</p>
                            <p>Nationality: {driver.nationality}</p>
                        </div>
                        <div className="relative w-12 h-12">
                            <Image
                                src={`/teams/${driver.team?.toLowerCase().replace(/\s+/g, '-')}.png`}
                                alt={`${driver.team} logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DriverHighlightCards;
