"use client"

import React, { useState, useEffect } from 'react'
import Navbar from "@/components/ui/navbar"
import { ChevronDown, Trophy, ExternalLink } from 'lucide-react'
import { Driver, Season, ApiError } from '@/lib/f1-api/types'
import { getDriversByYear } from '@/lib/f1-api/drivers'
import { getAvailableSeasons } from '@/lib/f1-api'

export default function DriversPage() {
    const [currentDrivers, setCurrentDrivers] = useState<Driver[]>([]);
    const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear().toString());
    const [availableSeasons, setAvailableSeasons] = useState<Season[]>([]);
    const [formattedSeasons, setFormattedSeasons] = useState<string[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
    const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

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
    }, [selectedDriverId, currentDrivers])

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
            <Navbar />            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">F1 Drivers</h1>                    <div className="relative w-full md:w-48">
                        {isLoadingSeasons ? (
                            <div className="bg-[#1E1E1E] border border-gray-700 rounded-md py-2 px-4 text-white flex items-center justify-between">
                                <span className="text-gray-400">Loading seasons...</span>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(e.target.value)}
                                    className="appearance-none bg-[#1E1E1E] border border-gray-700 rounded-md py-2 px-4 pr-8 text-white w-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                                >                                    {formattedSeasons.map((season: string) => (
                                    <option key={season} value={season}>
                                        {`${season} Season`}
                                    </option>
                                ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>

                {apiError && (
                    <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 px-4 py-3 rounded mb-6 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {apiError}
                    </div>
                )}

                {isLoadingDrivers ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : selectedDriver ? (
                    <div className="mb-6">
                        {/* Driver Detail View */}
                        <button
                            onClick={() => setSelectedDriverId(null)}
                            className="mb-6 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            ← Back to all drivers
                        </button>

                        <div className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-xl overflow-hidden shadow-lg">
                            <div className="relative h-64 md:h-96 bg-gradient-to-r from-black via-black/70 to-transparent">
                                {selectedDriver.imageUrl && (
                                    <div className="absolute inset-0">
                                        <div className="w-full h-full overflow-hidden">
                                            <img
                                                src={selectedDriver.imageUrl}
                                                alt={`${selectedDriver.name} ${selectedDriver.surname}`}
                                                className="w-full h-full object-cover object-top opacity-60"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
                                    </div>
                                )}

                                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="bg-white/10 rounded-md px-3 py-1 text-sm">
                                            #{selectedDriver.number || "N/A"}
                                        </span>
                                        <span className="bg-white/10 rounded-md px-3 py-1 text-sm">
                                            {getCountryFlag(selectedDriver.nationality)} {selectedDriver.nationality}
                                        </span>
                                        {selectedDriver.position && (
                                            <span className="bg-white/10 rounded-md px-3 py-1 text-sm flex items-center">
                                                P{selectedDriver.position} in standings
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-4xl md:text-6xl font-bold">
                                        {selectedDriver.name} <span className="text-purple-500">{selectedDriver.surname}</span>
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Driver Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Full Name</span>
                                                <span className="font-medium">{selectedDriver.name} {selectedDriver.surname}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Driver Code</span>
                                                <span className="font-medium">{selectedDriver.shortName}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Number</span>
                                                <span className="font-medium">#{selectedDriver.number || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Date of Birth</span>
                                                <span className="font-medium">{new Date(selectedDriver.birthday).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Nationality</span>
                                                <span className="font-medium">{getCountryFlag(selectedDriver.nationality)} {selectedDriver.nationality}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Team</span>
                                                <span className="font-medium">{selectedDriver.team || "N/A"}</span>
                                            </div>
                                            {selectedDriver.url && (
                                                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                    <span className="text-gray-400">Wikipedia</span>
                                                    <a
                                                        href={selectedDriver.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                    >
                                                        View Profile
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Season Statistics</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Current Position</span>
                                                <span className="font-medium">{selectedDriver.position ? `P${selectedDriver.position}` : "N/A"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Points</span>
                                                <span className="font-medium">{selectedDriver.points || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Wins</span>
                                                <span className="font-medium flex items-center">
                                                    {selectedDriver.wins ? (
                                                        <>
                                                            <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                                                            {selectedDriver.wins}
                                                        </>
                                                    ) : (
                                                        "0"
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentDrivers.map((driver) => (
                            <div
                                key={driver.driverId}
                                className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                                onClick={() => setSelectedDriverId(driver.driverId)}
                            >
                                <div className="h-48 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] relative">
                                    {driver.imageUrl ? (
                                        <img
                                            src={driver.imageUrl}
                                            alt={`${driver.name} ${driver.surname}`}
                                            className="h-full w-full object-cover object-top"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <span className="text-3xl font-bold">{driver.shortName}</span>
                                        </div>
                                    )}

                                    {driver.position && (
                                        <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-sm font-bold">
                                            P{driver.position}
                                        </div>
                                    )}

                                    {driver.number && (
                                        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-sm font-bold">
                                            #{driver.number}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">{driver.surname}</h3>
                                        <span className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded">
                                            {driver.shortName}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{driver.name}</p>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs text-gray-400 flex items-center">
                                            {getCountryFlag(driver.nationality)} {driver.nationality}
                                        </span>

                                        {driver.points !== undefined && (
                                            <span className="text-xs font-medium bg-gray-800 px-2 py-1 rounded">
                                                {driver.points} PTS
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-800">
                                        <p className="text-xs text-gray-400">Team</p>
                                        <p className="font-medium truncate">{driver.team || "Unknown"}</p>
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
