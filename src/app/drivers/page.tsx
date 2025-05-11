"use client"

import React, { useState, useEffect } from 'react'
import Navbar from "@/components/ui/navbar"
import { ChevronDown, Trophy } from 'lucide-react'

// Define a Driver type locally to avoid importing from API
interface Driver {
    driverId: string;
    name: string;
    surname: string;
    nationality: string;
    birthday: string;
    number: number;
    shortName: string;
    team?: string;
    teamColor?: string;
    imageUrl?: string;
    position?: number;
    points?: number;
    wins?: number;
}

// Static data for drivers (current season 2023)
const STATIC_DRIVERS: Driver[] = [
    {
        driverId: "max_verstappen",
        name: "Max",
        surname: "Verstappen",
        nationality: "Dutch",
        birthday: "1997-09-30",
        number: 1,
        shortName: "VER",
        team: "Red Bull Racing",
        teamColor: "#0600EF",
        imageUrl: "/drivers/ver.png",
        position: 1,
        points: 443,
        wins: 19
    },
    {
        driverId: "lando_norris",
        name: "Lando",
        surname: "Norris",
        nationality: "British",
        birthday: "1999-11-13",
        number: 4,
        shortName: "NOR",
        team: "McLaren",
        teamColor: "#FF8700",
        imageUrl: "/drivers/nor.png",
        position: 2,
        points: 334,
        wins: 3
    },
    {
        driverId: "charles_leclerc",
        name: "Charles",
        surname: "Leclerc",
        nationality: "Monegasque",
        birthday: "1997-10-16",
        number: 16,
        shortName: "LEC",
        team: "Ferrari",
        teamColor: "#DC0000",
        imageUrl: "/drivers/lec.png",
        position: 3,
        points: 291,
        wins: 1
    },
    {
        driverId: "oscar_piastri",
        name: "Oscar",
        surname: "Piastri",
        nationality: "Australian",
        birthday: "2001-04-06",
        number: 81,
        shortName: "PIA",
        team: "McLaren",
        teamColor: "#FF8700",
        imageUrl: "/drivers/pia.png",
        position: 4,
        points: 268,
        wins: 1
    },
    {
        driverId: "carlos_sainz",
        name: "Carlos",
        surname: "Sainz",
        nationality: "Spanish",
        birthday: "1994-09-01",
        number: 55,
        shortName: "SAI",
        team: "Ferrari",
        teamColor: "#DC0000",
        imageUrl: "/drivers/sai.png",
        position: 5,
        points: 243,
        wins: 1
    },
    {
        driverId: "lewis_hamilton",
        name: "Lewis",
        surname: "Hamilton",
        nationality: "British",
        birthday: "1985-01-07",
        number: 44,
        shortName: "HAM",
        team: "Mercedes",
        teamColor: "#00D2BE",
        imageUrl: "/drivers/ham.png",
        position: 6,
        points: 191,
        wins: 0
    },
    {
        driverId: "george_russell",
        name: "George",
        surname: "Russell",
        nationality: "British",
        birthday: "1998-02-15",
        number: 63,
        shortName: "RUS",
        team: "Mercedes",
        teamColor: "#00D2BE",
        imageUrl: "/drivers/rus.png",
        position: 7,
        points: 177,
        wins: 1
    },
    {
        driverId: "sergio_perez",
        name: "Sergio",
        surname: "Perez",
        nationality: "Mexican",
        birthday: "1990-01-26",
        number: 11,
        shortName: "PER",
        team: "Red Bull Racing",
        teamColor: "#0600EF",
        imageUrl: "/drivers/per.png",
        position: 8,
        points: 151,
        wins: 0
    },
    {
        driverId: "fernando_alonso",
        name: "Fernando",
        surname: "Alonso",
        nationality: "Spanish",
        birthday: "1981-07-29",
        number: 14,
        shortName: "ALO",
        team: "Aston Martin",
        teamColor: "#006F62",
        imageUrl: "/drivers/alo.png",
        position: 9,
        points: 62,
        wins: 0
    },
    {
        driverId: "nico_hulkenberg",
        name: "Nico",
        surname: "Hülkenberg",
        nationality: "German",
        birthday: "1987-08-19",
        number: 27,
        shortName: "HUL",
        team: "Haas F1 Team",
        teamColor: "#FFFFFF",
        imageUrl: "/drivers/hul.png",
        position: 10,
        points: 22,
        wins: 0
    },
    {
        driverId: "lance_stroll",
        name: "Lance",
        surname: "Stroll",
        nationality: "Canadian",
        birthday: "1998-10-29",
        number: 18,
        shortName: "STR",
        team: "Aston Martin",
        teamColor: "#006F62",
        imageUrl: "/drivers/str.png",
        position: 11,
        points: 21,
        wins: 0
    },
    {
        driverId: "yuki_tsunoda",
        name: "Yuki",
        surname: "Tsunoda",
        nationality: "Japanese",
        birthday: "2000-05-11",
        number: 22,
        shortName: "TSU",
        team: "RB",
        teamColor: "#1E3D61",
        imageUrl: "/drivers/tsu.png",
        position: 12,
        points: 20,
        wins: 0
    },
    {
        driverId: "alex_albon",
        name: "Alexander",
        surname: "Albon",
        nationality: "Thai",
        birthday: "1996-03-23",
        number: 23,
        shortName: "ALB",
        team: "Williams",
        teamColor: "#005AFF",
        imageUrl: "/drivers/alb.png",
        position: 13,
        points: 12,
        wins: 0
    },
    {
        driverId: "daniel_ricciardo",
        name: "Daniel",
        surname: "Ricciardo",
        nationality: "Australian",
        birthday: "1989-07-01",
        number: 3,
        shortName: "RIC",
        team: "RB",
        teamColor: "#1E3D61",
        imageUrl: "/drivers/ric.png",
        position: 14,
        points: 12,
        wins: 0
    },
    {
        driverId: "oliver_bearman",
        name: "Oliver",
        surname: "Bearman",
        nationality: "British",
        birthday: "2005-05-08",
        number: 87,
        shortName: "BEA",
        team: "Haas F1 Team",
        teamColor: "#FFFFFF",
        imageUrl: "/drivers/bea.png",
        position: 15,
        points: 7,
        wins: 0
    },
    {
        driverId: "kevin_magnussen",
        name: "Kevin",
        surname: "Magnussen",
        nationality: "Danish",
        birthday: "1992-10-05",
        number: 20,
        shortName: "MAG",
        team: "Haas F1 Team",
        teamColor: "#FFFFFF",
        imageUrl: "/drivers/mag.png",
        position: 16,
        points: 5,
        wins: 0
    },
    {
        driverId: "esteban_ocon",
        name: "Esteban",
        surname: "Ocon",
        nationality: "French",
        birthday: "1996-09-17",
        number: 31,
        shortName: "OCO",
        team: "Alpine",
        teamColor: "#0090FF",
        imageUrl: "/drivers/oco.png",
        position: 17,
        points: 5,
        wins: 0
    },
    {
        driverId: "pierre_gasly",
        name: "Pierre",
        surname: "Gasly",
        nationality: "French",
        birthday: "1996-02-07",
        number: 10,
        shortName: "GAS",
        team: "Alpine",
        teamColor: "#0090FF",
        imageUrl: "/drivers/gas.png",
        position: 18,
        points: 5,
        wins: 0
    },
    {
        driverId: "valtteri_bottas",
        name: "Valtteri",
        surname: "Bottas",
        nationality: "Finnish",
        birthday: "1989-08-28",
        number: 77,
        shortName: "BOT",
        team: "Kick Sauber",
        teamColor: "#900000",
        imageUrl: "/drivers/bot.png",
        position: 19,
        points: 0,
        wins: 0
    },
    {
        driverId: "zhou_guanyu",
        name: "Zhou",
        surname: "Guanyu",
        nationality: "Chinese",
        birthday: "1999-05-30",
        number: 24,
        shortName: "ZHO",
        team: "Kick Sauber",
        teamColor: "#900000",
        imageUrl: "/drivers/zho.png",
        position: 20,
        points: 0,
        wins: 0
    }
];

// Static data for drivers from past seasons
const STATIC_DRIVERS_2023 = [...STATIC_DRIVERS].map(driver => ({ ...driver }));
const STATIC_DRIVERS_2022 = [...STATIC_DRIVERS].map(driver => ({ ...driver }));

// Mapping of season to static driver data
const SEASON_DATA: Record<string, Driver[]> = {
    "current": STATIC_DRIVERS,
    "2023": STATIC_DRIVERS_2023,
    "2022": STATIC_DRIVERS_2022,
};

export default function DriversPage() {
    const [currentDrivers, setCurrentDrivers] = useState<Driver[]>([])
    const [selectedSeason, setSelectedSeason] = useState("current")
    const [seasons] = useState<string[]>([
        "current", "2023", "2022", "2021", "2020", "2019", "2018", "2017"
    ])
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)

    useEffect(() => {
        // Use static data instead of API call
        const fetchDrivers = () => {
            setIsLoadingDrivers(true);

            // Simulate network delay
            setTimeout(() => {
                const drivers = SEASON_DATA[selectedSeason] || STATIC_DRIVERS;
                setCurrentDrivers(drivers);
                setIsLoadingDrivers(false);
            }, 500);
        };

        fetchDrivers();
    }, [selectedSeason])

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
            'Chinese': '🇨🇳'
        };

        return flags[nationality] || '';
    }

    return (
        <main className="min-h-screen bg-[#121212] text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">F1 Drivers</h1>

                    <div className="relative w-full md:w-48">
                        <select
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                            className="appearance-none bg-[#1E1E1E] border border-gray-700 rounded-md py-2 px-4 pr-8 text-white w-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                            {seasons.map((season) => (
                                <option key={season} value={season}>
                                    {season === "current" ? "Current Season" : `${season} Season`}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

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
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Season Statistics</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Team</span>
                                                <span className="font-medium">{selectedDriver.team || "N/A"}</span>
                                            </div>
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
