"use client"

import React, { useState, useEffect } from 'react'
import Navbar from "@/components/ui/navbar"
import { ChevronDown, Trophy, ExternalLink } from 'lucide-react'
import { Driver, Season, ApiError } from '@/lib/f1-api/types'
import { getDriversByYear } from '@/lib/f1-api/drivers'
import { getAvailableSeasons } from '@/lib/f1-api'
import Image from 'next/image'

// Custom styles for text shadow
const textShadowStyle = {
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
}

export default function DriversPage() {
    const [currentDrivers, setCurrentDrivers] = useState<Driver[]>([]);
    const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear().toString());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [availableSeasons, setAvailableSeasons] = useState<Season[]>([]);
    const [formattedSeasons, setFormattedSeasons] = useState<string[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
    const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Fetch drivers from API only
        const fetchDrivers = async () => {
            setIsLoadingDrivers(true);
            setApiError(null);

            try {
                // Use the selected season
                const year = selectedSeason;

                // Call our API function
                const result = await getDriversByYear(year);

                if (result.error) {
                    console.error("Error fetching drivers:", result.error);
                    setCurrentDrivers([]);
                    setApiError(`Couldn't load driver data for ${year}. ${result.error.message || ''}`);
                } else if (result.data && result.data.length > 0) {
                    setCurrentDrivers(result.data);
                } else {
                    setCurrentDrivers([]);
                    setApiError(`No driver data available for ${year}.`);
                }
            } catch (error) {
                console.error("Error in fetchDrivers:", error);
                setCurrentDrivers([]);
                setApiError(`Error loading driver data. Please try again later.`);
            } finally {
                setIsLoadingDrivers(false);
            }
        };

        fetchDrivers();
    }, [selectedSeason]);

    useEffect(() => {
        // Fetch available seasons from the API
        setIsLoadingSeasons(true);

        getAvailableSeasons().then((res: { data: Season[]; error?: ApiError }) => {
            setIsLoadingSeasons(false);

            if (res.error) {
                console.error("Error fetching seasons:", res.error);
                return;
            }

            if (res.data && res.data.length > 0) {
                // Sort seasons in descending order (newest first)
                const sortedSeasons = [...res.data].sort((a, b) => b.year - a.year);
                setAvailableSeasons(sortedSeasons);

                // Format seasons for display in dropdown
                const availableYears = sortedSeasons.map(s => s.year.toString());

                // Make sure there are no duplicates
                const uniqueYears = Array.from(new Set(availableYears));
                setFormattedSeasons(uniqueYears);

                // Set current year or most recent year as default
                if (uniqueYears.length > 0) {
                    setSelectedSeason(uniqueYears[0]);
                }
            }
        }).catch(error => {
            console.error("Error fetching seasons:", error);
            setIsLoadingSeasons(false);
        });
    }, []);

    useEffect(() => {
        if (selectedDriverId && currentDrivers.length > 0) {
            const driver = currentDrivers.find(d => d.driverId === selectedDriverId) || null
            setSelectedDriver(driver)
        } else {
            setSelectedDriver(null)
        }
    }, [selectedDriverId, currentDrivers])    // Get the correct image URL based on our tracking of failed images
    const getDriverImageUrl = (driver: Driver): string => {
        if (!driver.imageUrl || failedImageUrls.has(driver.imageUrl)) {
            // If we know this URL has failed before, use the fallback directly
            return `/drivers/${driver.shortName?.toLowerCase() || 'default'}.png`;
        }
        return driver.imageUrl;
    };

    // Handle image loading error
    const handleImageError = (driver: Driver, imageUrl: string) => {
        if (!failedImageUrls.has(imageUrl)) {
            // Add to our set of failed URLs so we don't try again
            setFailedImageUrls(prev => new Set(prev).add(imageUrl));
            console.log(`Image failed to load for ${driver.name} ${driver.surname}, using fallback`);
        }
    };

    // Simple function to get emoji flags based on nationality
    const getCountryFlag = (nationality: string): string => {
        const flags: Record<string, string> = {
            'Dutch': '🇳🇱',
            'British': '🇬🇧',
            'Monegasque': '🇲🇨',
            'Australian': '🇦🇺',
            'Spanish': '🇪🇸',
            'Mexican': '🇲🇽',
            'German': '🇩🇪',
            'Canadian': '🇨🇦',
            'Japanese': '🇯🇵',
            'Thai': '🇹🇭',
            'Danish': '🇩🇰',
            'French': '🇫🇷',
            'Finnish': '🇫🇮',
            'Chinese': '🇨🇳',
            'Italian': '🇮🇹',
            'Brazilian': '🇧🇷',
            'New Zealander': '🇳🇿',
            'Netherlands': '🇳🇱',
            'Great Britain': '🇬🇧',
            'Monaco': '🇲🇨',
            'Australia': '🇦🇺',
            'Spain': '🇪🇸',
            'Mexico': '🇲🇽',
            'Germany': '🇩🇪',
            'Canada': '🇨🇦',
            'Japan': '🇯🇵',
            'Thailand': '🇹🇭',
            'Denmark': '🇩🇰',
            'France': '🇫🇷',
            'Finland': '🇫🇮',
            'China': '🇨🇳',
            'Italy': '🇮🇹',
            'Brazil': '🇧🇷',
            'New Zealand': '🇳🇿'
        };

        return flags[nationality] || '';
    }

    return (
        <main className="min-h-screen bg-[#121212] text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold" style={textShadowStyle}>F1 Drivers</h1>
                    <div className="relative w-full md:w-64">
                        {isLoadingSeasons ? (
                            <div className="bg-[#1E1E1E]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg py-2 px-4 text-white flex items-center justify-between shadow-md">
                                <span className="text-gray-400">Loading seasons...</span>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="relative group">
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(e.target.value)}
                                    className="appearance-none bg-[#1E1E1E]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg py-3 px-5 pr-10 text-white w-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 shadow-md hover:bg-[#242424]/80"
                                >
                                    {formattedSeasons.map((season: string) => (
                                        <option key={season} value={season}>
                                            {`${season} Formula 1 Season`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400 pointer-events-none transition-transform group-hover:text-purple-300" />
                            </div>
                        )}
                    </div>
                </div>

                {apiError && (
                    <div className="bg-yellow-900/40 backdrop-blur-sm border border-yellow-700/50 text-yellow-200 px-4 sm:px-5 py-3 sm:py-4 rounded-lg mb-4 sm:mb-6 flex items-center shadow-lg">
                        <svg className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm sm:text-base">{apiError}</span>
                    </div>
                )}

                {isLoadingDrivers ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-t-2 border-b-2 border-purple-500"></div>
                            <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-t-2 border-r-2 border-purple-400 absolute top-2 left-2"></div>
                            <div className="animate-pulse absolute top-4 sm:top-5 left-4 sm:left-5 h-4 sm:h-6 w-4 sm:w-6 bg-purple-600 rounded-full"></div>
                        </div>
                        <p className="mt-4 text-gray-400">Loading drivers...</p>
                    </div>
                ) : selectedDriver ? (
                    <div className="mb-6">
                        {/* Driver Detail View */}
                        <button
                            onClick={() => setSelectedDriverId(null)}
                            className="mb-4 sm:mb-6 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center text-sm sm:text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to all drivers
                        </button>

                        <div className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-xl overflow-hidden shadow-xl border border-gray-800/20">
                            <div className="relative h-48 sm:h-64 md:h-96 bg-gradient-to-r from-black via-black/70 to-transparent">
                                {selectedDriver.imageUrl && !failedImageUrls.has(selectedDriver.imageUrl) ? (
                                    <div className="absolute inset-0">
                                        <div className="w-full h-full overflow-hidden">
                                            <Image
                                                src={getDriverImageUrl(selectedDriver)}
                                                alt={`${selectedDriver.name} ${selectedDriver.surname}`}
                                                className="w-full h-full object-cover object-top opacity-70"
                                                onError={() => handleImageError(selectedDriver, selectedDriver.imageUrl!)}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0">
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] opacity-70">
                                            <span className="text-6xl font-bold text-gray-600">{selectedDriver.shortName}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
                                    </div>
                                )}

                                <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="bg-white/10 backdrop-blur-sm rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium">
                                            #{selectedDriver.number || "N/A"}
                                        </span>
                                        <span className="bg-white/10 backdrop-blur-sm rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium">
                                            <span className="mr-1 text-sm sm:text-base">{getCountryFlag(selectedDriver.nationality)}</span> {selectedDriver.nationality}
                                        </span>
                                        {selectedDriver.position && (
                                            <span className="bg-purple-900/30 backdrop-blur-sm rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium flex items-center">
                                                <span className="mr-1">P{selectedDriver.position}</span> in standings
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold" style={textShadowStyle}>
                                        {selectedDriver.name} <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">{selectedDriver.surname}</span>
                                    </h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                                    <div className="bg-[#1A1A1A]/50 rounded-xl p-4 sm:p-5 border border-gray-800/20">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Driver Information
                                        </h3>

                                        <div className="space-y-3 text-sm sm:text-base">
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Full Name</span>
                                                <span className="font-medium">{selectedDriver.name} {selectedDriver.surname}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Driver Code</span>
                                                <span className="font-medium bg-gray-800/50 px-2 py-1 rounded-md">{selectedDriver.shortName}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Number</span>
                                                <span className="font-medium bg-gray-800/50 px-2 py-1 rounded-md">#{selectedDriver.number || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Date of Birth</span>
                                                <span className="font-medium">{new Date(selectedDriver.birthday).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Nationality</span>
                                                <span className="font-medium flex items-center">
                                                    <span className="text-lg mr-2">{getCountryFlag(selectedDriver.nationality)}</span>
                                                    {selectedDriver.nationality}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Team</span>
                                                <span className="font-medium">{selectedDriver.team || "N/A"}</span>
                                            </div>
                                            {selectedDriver.url && (
                                                <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                    <span className="text-gray-400">Wikipedia</span>
                                                    <a
                                                        href={selectedDriver.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors duration-200"
                                                    >
                                                        View Profile
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-[#1A1A1A]/50 rounded-xl p-4 sm:p-5 border border-gray-800/20">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Season Statistics
                                        </h3>

                                        <div className="space-y-3 text-sm sm:text-base">
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Current Position</span>
                                                {selectedDriver.position ? (
                                                    <span className="font-medium bg-purple-900/30 px-3 py-1 rounded-md">P{selectedDriver.position}</span>
                                                ) : (
                                                    <span className="font-medium text-gray-500">N/A</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Points</span>
                                                <span className="font-medium bg-gray-800/50 px-3 py-1 rounded-md">{selectedDriver.points !== undefined ? selectedDriver.points : 0} PTS</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                                                <span className="text-gray-400">Wins</span>
                                                <span className="font-medium flex items-center">
                                                    {selectedDriver.wins ? (
                                                        <span className="bg-yellow-900/30 px-3 py-1 rounded-md flex items-center">
                                                            <Trophy className="h-4 w-4 mr-2 text-yellow-400" />
                                                            {selectedDriver.wins}
                                                        </span>
                                                    ) : (
                                                        <span className="bg-gray-800/50 px-3 py-1 rounded-md">0</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Add some stats visualization if available */}
                                        {selectedDriver.points !== undefined && (
                                            <div className="mt-6 pt-4 border-t border-gray-800/50">
                                                <h4 className="text-sm text-gray-400 mb-2">Performance</h4>
                                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                                                        style={{ width: `${Math.min(selectedDriver.points / 2, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {currentDrivers.map((driver) => (
                            <div
                                key={driver.driverId}
                                className="bg-gradient-to-b from-[#1E1E1E] to-[#181818] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border border-gray-800/30"
                                onClick={() => setSelectedDriverId(driver.driverId)}
                            >
                                <div className="h-40 sm:h-52 relative overflow-hidden">
                                    {driver.imageUrl && !failedImageUrls.has(driver.imageUrl) ? (
                                        <>
                                            <Image
                                                src={getDriverImageUrl(driver)}
                                                alt={`${driver.name} ${driver.surname}`}
                                                className="object-cover object-top transition-transform duration-500 hover:scale-105"
                                                onError={() => handleImageError(driver, driver.imageUrl!)}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]">
                                            <span className="text-4xl font-bold text-gray-600">{driver.shortName}</span>
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex justify-between items-center">
                                        <h3 className="text-xl font-bold drop-shadow-lg">{driver.surname}</h3>
                                        <span className="text-xs bg-purple-900/70 text-purple-200 px-2 py-1 rounded-md font-semibold">
                                            {driver.shortName}
                                        </span>
                                    </div>

                                    {driver.position && (
                                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-bold">
                                            P{driver.position}
                                        </div>
                                    )}

                                    {driver.number && (
                                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-bold">
                                            #{driver.number}
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 sm:p-4">
                                    <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">{driver.name}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <span className="mr-1 text-sm sm:text-base">{getCountryFlag(driver.nationality)}</span>
                                            {driver.nationality}
                                        </span>

                                        {driver.points !== undefined && (
                                            <span className="text-xs font-medium bg-gray-800/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                                                {driver.points} PTS
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-800/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Team</p>
                                                <p className="font-medium truncate text-xs sm:text-sm">{driver.team || "Unknown"}</p>
                                            </div>
                                            {driver.wins !== undefined && driver.wins > 0 && (
                                                <div className="flex items-center bg-yellow-900/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                                                    <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-yellow-500" />
                                                    <span className="text-[10px] sm:text-xs text-yellow-200">{driver.wins}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
