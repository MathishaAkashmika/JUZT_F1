import React, { useEffect, useState, JSX } from 'react';
import { Stint, TyreDriver, getDriversForTyreStrategy, getAllDriverStints, getTyreColor } from '@/lib/f1-api/tyres';
import Image from 'next/image';

interface TyreStrategyPanelProps {
    sessionKey: number | null;
    isLoadingSession: boolean;
}

const TyreStrategyPanel: React.FC<TyreStrategyPanelProps> = ({ sessionKey, isLoadingSession }) => {
    const [drivers, setDrivers] = useState<TyreDriver[]>([]);
    const [stintsByDriver, setStintsByDriver] = useState<{ [key: number]: Stint[] }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [maxLaps, setMaxLaps] = useState<number>(0);
    const [hoveredStint, setHoveredStint] = useState<Stint | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!sessionKey) return;

            setIsLoading(true);
            setError(null);

            try {
                // Fetch drivers for this session
                const driversResult = await getDriversForTyreStrategy(sessionKey);

                if (driversResult.error) {
                    setError(driversResult.error.message);
                    return;
                }

                if (driversResult.data.length === 0) {
                    setError("No drivers found for this session");
                    return;
                }

                // Sort drivers by team and driver number
                const sortedDrivers = [...driversResult.data].sort((a, b) => {
                    if (a.team_name === b.team_name) {
                        return a.driver_number - b.driver_number;
                    }
                    return a.team_name.localeCompare(b.team_name);
                });

                setDrivers(sortedDrivers);

                // Fetch all driver stints
                const allStints = await getAllDriverStints(sessionKey, sortedDrivers);
                setStintsByDriver(allStints);

                // Calculate max laps for display
                let max = 0;
                Object.values(allStints).forEach(driverStints => {
                    driverStints.forEach(stint => {
                        if (stint.lap_end > max) max = stint.lap_end;
                    });
                });
                setMaxLaps(max);

            } catch (err) {
                console.error('Error in TyreStrategyPanel:', err);
                setError('Failed to load tire strategy data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sessionKey]);

    // Helper function to get driver abbreviation
    const getDriverAbbreviation = (driver: TyreDriver): string => {
        return driver.name_acronym || `${driver.first_name[0]}${driver.last_name[0]}${driver.last_name[1]}`;
    };

    // Helper function to render a single stint
    const renderStint = (stint: Stint, totalLaps: number, isSelected: boolean): JSX.Element => {
        const width = ((stint.lap_end - stint.lap_start) / totalLaps) * 100;
        const left = (stint.lap_start / totalLaps) * 100;
        const tyreColor = getTyreColor(stint.compound);
        const isHovered = hoveredStint === stint;

        // Calculate stint duration
        const stintDuration = stint.lap_end - stint.lap_start;

        // Determine border style based on selection/hover state
        const borderStyle = isHovered
            ? "2px solid white"
            : isSelected
                ? "2px solid rgba(255, 255, 255, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.2)";

        return (
            <div
                key={`${stint.driver_number}-${stint.stint_number}`}
                className="absolute h-full flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer"
                style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: tyreColor,
                    color: tyreColor === '#FFFFFF' || tyreColor === '#FFFF00' ? '#000000' : '#FFFFFF',
                    textAlign: 'center',
                    overflow: 'hidden',
                    border: borderStyle,
                    boxShadow: isHovered ? '0 0 8px rgba(255, 255, 255, 0.5)' : 'none',
                    zIndex: isHovered ? 10 : 5,
                    transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)'
                }}
                title={`${stint.compound} (Age: ${stint.tyre_age_at_start}) - Laps ${stint.lap_start} to ${stint.lap_end}`}
                onMouseEnter={() => setHoveredStint(stint)}
                onMouseLeave={() => setHoveredStint(null)}
            >
                {width > 10 ? (
                    <>
                        {stint.compound[0]}
                        {width > 25 && <span className="text-xs opacity-80"> • {stintDuration} laps</span>}
                    </>
                ) : ''}
            </div>
        );
    };

    // Function to render tooltip for hovered stint
    const renderHoverTooltip = () => {
        if (!hoveredStint) return null;

        const driver = drivers.find(d => d.driver_number === hoveredStint.driver_number);
        if (!driver) return null;

        return (
            <div className="absolute top-0 left-0 transform -translate-y-full bg-black/90 text-white p-3 rounded-lg shadow-lg z-20 border border-gray-600 text-xs"
                style={{ maxWidth: '250px' }}>
                <div className="font-bold mb-1 border-b border-gray-600 pb-1 flex justify-between">
                    <span>{driver.full_name}</span>
                    <span style={{ color: driver.team_colour }}>{getDriverAbbreviation(driver)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <span className="text-gray-400">Compound:</span>
                        <div className="flex items-center mt-1">
                            <div
                                className="w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: getTyreColor(hoveredStint.compound) }}
                            ></div>
                            <span>{hoveredStint.compound}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-400">Tyre Age:</span>
                        <div className="mt-1">
                            {hoveredStint.tyre_age_at_start} lap{hoveredStint.tyre_age_at_start !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-400">Start Lap:</span>
                        <div className="mt-1">{hoveredStint.lap_start}</div>
                    </div>
                    <div>
                        <span className="text-gray-400">End Lap:</span>
                        <div className="mt-1">{hoveredStint.lap_end}</div>
                    </div>
                    <div className="col-span-2">
                        <span className="text-gray-400">Duration:</span>
                        <div className="mt-1">{hoveredStint.lap_end - hoveredStint.lap_start} laps</div>
                    </div>
                    <div className="col-span-2">
                        <span className="text-gray-400">Stint Number:</span>
                        <div className="mt-1">{hoveredStint.stint_number} of {stintsByDriver[hoveredStint.driver_number]?.length || '?'}</div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoadingSession || isLoading) {
        return (
            <div className="w-full rounded-xl border border-gray-700 bg-[#1A1A2E] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Tyre Strategy Analysis
                    </h2>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
                        <p className="text-gray-400">Loading tyre strategy data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full rounded-xl border border-gray-700 bg-[#1A1A2E] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Tyre Strategy Analysis
                    </h2>
                </div>
                <div className="bg-red-900/30 border border-red-500 text-white px-6 py-4 rounded-lg flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            </div>
        );
    }

    if (!sessionKey || drivers.length === 0) {
        return (
            <div className="w-full rounded-xl border border-gray-700 bg-[#1A1A2E] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Tyre Strategy Analysis
                    </h2>
                </div>
                <div className="bg-gray-800/50 text-gray-400 p-8 rounded-lg text-center flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Select a race session to view tyre strategies
                    <p className="text-sm mt-2 text-gray-500">Pit stops and compound choices will be displayed here</p>
                </div>
            </div>
        );
    }

    // Create lap markers
    const lapMarkers = [];
    const lapStep = maxLaps > 60 ? 10 : maxLaps > 30 ? 5 : 2;

    for (let i = 0; i <= maxLaps; i += lapStep) {
        const position = (i / maxLaps) * 100;
        lapMarkers.push(
            <div
                key={`lap-${i}`}
                className="absolute top-0 bottom-0 border-l border-gray-700"
                style={{ left: `${position}%` }}
            >
                <div className="absolute -top-5 -translate-x-1/2 text-xs text-gray-400">
                    {i}
                </div>
            </div>
        );
    }

    // Calculate stint stats
    const stintStats = {
        total: 0,
        compounds: {} as Record<string, number>
    };

    Object.values(stintsByDriver).forEach(driverStints => {
        driverStints.forEach(stint => {
            stintStats.total++;
            if (!stintStats.compounds[stint.compound]) {
                stintStats.compounds[stint.compound] = 0;
            }
            stintStats.compounds[stint.compound]++;
        });
    });

    return (
        <div className="w-full rounded-xl border border-gray-700 bg-gradient-to-br from-[#1A1A2E] to-[#0F0F24] p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Tyre Strategy Analysis
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {drivers.length} drivers | {maxLaps} laps | {stintStats.total} total stints
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    {Object.entries(stintStats.compounds)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([compound, count]) => (
                            <div key={compound} className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg border border-gray-700">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: getTyreColor(compound) }}
                                ></div>
                                <span className="text-xs font-bold" style={{
                                    color: getTyreColor(compound) === '#FFFFFF' || getTyreColor(compound) === '#FFFF00'
                                        ? '#FFFFFF'
                                        : getTyreColor(compound)
                                }}>
                                    {compound}
                                </span>
                                <span className="text-xs text-gray-400 ml-1">({count})</span>
                            </div>
                        ))}
                </div>
            </div>

            <div className="relative pt-8 pb-2 mb-2 bg-[#131323] rounded-t-lg border border-gray-800">
                <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 border-b border-gray-800">
                    <span className="text-sm font-bold text-gray-300">Lap Number</span>
                </div>
                {/* Lap markers */}
                {lapMarkers}
            </div>

            <div className="relative">
                {/* Grid for each driver */}
                <div className="overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    <div className="space-y-3 py-2">
                        {drivers.map(driver => {
                            const driverStints = stintsByDriver[driver.driver_number] || [];
                            const isSelected = selectedDriver === driver.driver_number;

                            return (
                                <div
                                    key={driver.driver_number}
                                    className={`flex items-center transition-all duration-300 ${isSelected ? 'scale-[1.01]' : ''} 
                                              hover:bg-white/5 rounded-lg p-1 -ml-1 cursor-pointer`}
                                    onClick={() => setSelectedDriver(isSelected ? null : driver.driver_number)}
                                >
                                    <div className="flex-shrink-0 w-16 flex flex-col items-center mr-3">
                                        {driver.headshot_url ? (<div className="h-8 w-8 rounded-full overflow-hidden mb-1 border-2"
                                            style={{ borderColor: driver.team_colour || '#cccccc' }}>
                                            <Image
                                                src={driver.headshot_url}
                                                alt={driver.full_name}
                                                className="object-cover"
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                        ) : (
                                            <div
                                                className="h-8 w-8 rounded-full flex items-center justify-center mb-1 text-white text-xs font-bold"
                                                style={{ backgroundColor: driver.team_colour || '#cccccc' }}
                                            >
                                                {getDriverAbbreviation(driver)}
                                            </div>
                                        )}
                                        <div
                                            className="flex-shrink-0 h-5 px-2 rounded-full flex items-center justify-center text-[10px] font-bold"
                                            style={{ backgroundColor: driver.team_colour || '#cccccc' }}
                                        >
                                            {driver.driver_number}
                                        </div>
                                    </div>
                                    <div className="flex-grow h-8 bg-gray-800/70 rounded-lg relative overflow-hidden border border-gray-700/50">
                                        {driverStints.map(stint => renderStint(stint, maxLaps, isSelected))}

                                        {driverStints.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                                                No stint data available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {hoveredStint && renderHoverTooltip()}
            </div>

            <div className="mt-6 border-t border-gray-800 pt-4 text-xs text-gray-500">
                <p>Tyre information provided by OpenF1 API. Click on a driver row to highlight their strategy.</p>
            </div>
        </div>
    );
};

export default TyreStrategyPanel;
