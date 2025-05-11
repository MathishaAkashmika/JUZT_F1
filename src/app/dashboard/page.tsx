"use client"

import React, { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Navbar from "@/components/ui/navbar"
import {
    getAvailableSeasons,
    getTracks,
    getRaceSessions,
    getSessionResults,
    getDriverStandings,
    Season,
    Track,
    Session,
    SessionResult,
    Driver,
    ApiError
} from '../../lib/f1-api'
import axios from 'axios'

export default function RaceDashboard() {
    const [selectedSeason, setSelectedSeason] = useState("")
    const [selectedTrack, setSelectedTrack] = useState("")
    const [selectedSession, setSelectedSession] = useState("")
    const [seasons, setSeasons] = useState<Season[]>([])
    const [tracks, setTracks] = useState<Track[]>([])
    const [sessions, setSessions] = useState<Session[]>([])
    const [selectedDriver, setSelectedDriver] = useState(0)
    const [isLoadingTracks, setIsLoadingTracks] = useState(false)
    const [isLoadingSessions, setIsLoadingSessions] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [topDrivers, setTopDrivers] = useState<any[]>([])
    const [sessionResults, setSessionResults] = useState<SessionResult[]>([])
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const [driverStandings, setDriverStandings] = useState<Driver[]>([])
    const [isLoadingDriverStandings, setIsLoadingDriverStandings] = useState(false)

    // Fetch seasons from the API instead of generating years locally
    useEffect(() => {
        getAvailableSeasons().then((res: { data: Season[]; error?: ApiError }) => {
            if (res.error) {
                setError(res.error.message)
                return
            }
            setSeasons(res.data)
        })
    }, [])

    // Fetch tracks when season changes
    useEffect(() => {
        if (!selectedSeason) return
        setSelectedTrack("")
        setSelectedSession("")
        setTracks([])
        setSessions([])
        setError(null)
        setIsLoadingTracks(true)

        getTracks(selectedSeason).then((res: { data: Track[]; error?: ApiError }) => {
            setIsLoadingTracks(false)
            if (res.error) {
                setError(res.error.message)
                return
            }
            setTracks(res.data)
        })
    }, [selectedSeason])

    // Fetch sessions when track changes
    useEffect(() => {
        if (!selectedSeason || !selectedTrack) return
        setSelectedSession("")
        setSessions([])
        setError(null)
        setIsLoadingSessions(true)

        // Find the track id
        const track = tracks.find(t => t.circuit.toLowerCase() === selectedTrack)
        if (!track) return

        getRaceSessions(selectedSeason, track.id.toString()).then((res: { data: Session[]; error?: ApiError }) => {
            setIsLoadingSessions(false)
            if (res.error) {
                setError(res.error.message)
                return
            }
            setSessions(res.data)
        })
    }, [selectedTrack, selectedSeason, tracks])

    // Fetch session results when session changes
    useEffect(() => {
        if (!selectedSeason || !selectedTrack || !selectedSession) return
        setSessionResults([])
        setError(null)
        setIsLoadingResults(true)

        // Find the track id and round number
        const track = tracks.find(t => t.circuit.toLowerCase() === selectedTrack)
        if (!track) return

        getSessionResults(selectedSeason, track.round.toString(), selectedSession).then((res: { data: SessionResult[]; error?: ApiError }) => {
            setIsLoadingResults(false)
            if (res.error) {
                setError(res.error.message)
                return
            }
            setSessionResults(res.data)
        })
    }, [selectedSession, selectedTrack, selectedSeason, tracks])

    // Fetch driver standings when season changes
    useEffect(() => {
        if (!selectedSeason) return
        setDriverStandings([])
        setError(null)
        setIsLoadingDriverStandings(true)

        getDriverStandings(selectedSeason).then((res: { data: Driver[]; error?: ApiError }) => {
            setIsLoadingDriverStandings(false)
            if (res.error) {
                setError(res.error.message)
                return
            }
            setDriverStandings(res.data)
        })
    }, [selectedSeason])

    // Format date and time for display
    const formatSessionDateTime = (session: Session) => {
        const date = new Date(`${session.date}T${session.time}`);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    const fetchTopDrivers = async (year: string, round: string, session: string) => {
        const { data, error } = await getSessionResults(year, round, session);
        if (data && data.length > 0) {
            setTopDrivers(data.slice(0, 3));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A] text-white font-mono tracking-wide">
            <Navbar />
            <div className="w-full flex flex-col items-center gap-4 py-8 px-4">
                {/* Error message */}
                {error && (
                    <div className="w-full bg-red-900/50 border border-red-500 text-white px-4 py-2 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Dropdowns */}
                <div className="flex flex-row gap-8 w-full justify-center items-center mt-4 mb-6">
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="w-40 rounded-xl bg-[#1E1E3A] border border-[#4A4AFF]/30 text-base py-2.5 px-4 font-mono flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#6A5ACD]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1E3A] border border-[#4A4AFF]/30 rounded-xl text-lg font-bold text-gray-200">
                            {seasons.map((season) => (
                                <SelectItem
                                    key={season.year}
                                    value={season.year.toString()}
                                    className="hover:bg-[#2D2D5A] focus:bg-[#2D2D5A] rounded-full px-4 py-2 transition-all"
                                >
                                    {season.year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedTrack} onValueChange={setSelectedTrack} disabled={isLoadingTracks || !selectedSeason}>
                        <SelectTrigger className="w-64 rounded-xl bg-[#1E1E3A] border border-[#4A4AFF]/30 text-base py-2.5 px-4 font-mono flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#6A5ACD]">
                            <SelectValue placeholder={isLoadingTracks ? "Loading..." : "Track"} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1E3A] border border-[#4A4AFF]/30 rounded-xl text-lg font-bold text-gray-200">
                            {tracks.map((track) => (
                                <SelectItem
                                    key={track.id}
                                    value={track.circuit.toLowerCase()}
                                    className="hover:bg-[#2D2D5A] focus:bg-[#2D2D5A] rounded-full px-4 py-2 transition-all"
                                >
                                    {track.circuit} ({track.country})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedSession} onValueChange={setSelectedSession} disabled={isLoadingSessions || !selectedTrack}>
                        <SelectTrigger className="w-40 rounded-xl bg-[#1E1E3A] border border-[#4A4AFF]/30 text-base py-2.5 px-4 font-mono flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#6A5ACD]">
                            <SelectValue placeholder={isLoadingSessions ? "Loading..." : "Session"} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1E3A] border border-[#4A4AFF]/30 rounded-xl text-lg font-bold text-gray-200">
                            {sessions.map((session) => (
                                <SelectItem
                                    key={session.id}
                                    value={session.type}
                                    className="hover:bg-[#2D2D5A] focus:bg-[#2D2D5A] rounded-full px-4 py-2 transition-all"
                                >
                                    {session.type.toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Driver Highlight Cards */}
                <div className="grid grid-cols-3 gap-4 w-full mb-2">
                    {isLoadingResults ? (
                        <div className="col-span-3 text-center text-gray-400 py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6A5ACD] mx-auto mb-2"></div>
                            Loading results...
                        </div>
                    ) : sessionResults.length > 0 ? (
                        sessionResults.slice(0, 3).map((result, idx) => (
                            <div
                                key={result.driver.driverId}
                                className={`relative rounded-xl border bg-gradient-to-br ${idx === 0 ? 'from-[#FFD700]/20 to-[#FFD700]/5' :
                                    idx === 1 ? 'from-[#C0C0C0]/20 to-[#C0C0C0]/5' :
                                        'from-[#CD7F32]/20 to-[#CD7F32]/5'
                                    } flex items-end h-24 overflow-hidden cursor-pointer transition-all duration-150 ${selectedDriver === idx ?
                                        `border-2 ${idx === 0 ? 'border-[#FFD700]' : idx === 1 ? 'border-[#C0C0C0]' : 'border-[#CD7F32]'}` :
                                        'border border-neutral-700'
                                    }`}
                                onClick={() => setSelectedDriver(idx)}
                            >
                                {/* Driver Image Background */}
                                {result.driver.imageUrl && (
                                    <div className="absolute right-0 top-0 h-full w-1/2 opacity-30" style={{ zIndex: 1 }}>
                                        <img
                                            src={result.driver.imageUrl}
                                            alt={result.driver.surname}
                                            className="h-full w-full object-contain object-right-top"
                                        />
                                    </div>
                                )}

                                {/* Overlay for darkening */}
                                <div className="absolute left-0 top-0 h-full w-full bg-black/40" style={{ zIndex: 2 }} />

                                {/* Content */}
                                <div className="relative flex flex-row justify-between items-end h-full w-full z-10 px-3 pb-2">
                                    <div className="flex flex-col justify-between h-full py-2">
                                        <div>
                                            <span className="text-xs font-bold leading-none block">{result.driver.surname}</span>
                                            <span className="text-[10px] text-gray-300 leading-none block">{result.team.teamName}</span>
                                            <span className="text-[10px] text-gray-400 leading-none block mt-1">{result.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end h-full">
                                        <div className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${idx === 0 ? 'border-[#FFD700] bg-[#FFD700]/20' :
                                            idx === 1 ? 'border-[#C0C0C0] bg-[#C0C0C0]/20' :
                                                'border-[#CD7F32] bg-[#CD7F32]/20'
                                            } flex items-center justify-center`}>
                                            {result.driver.imageUrl ? (
                                                <img
                                                    src={result.driver.imageUrl}
                                                    alt={result.driver.shortName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-xs font-bold">{result.driver.shortName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center text-gray-400 py-8">No session results available. Please select a year, track, and session.</div>
                    )}
                </div>

                {/* Top Panels + Standings Stacked */}
                <div className="grid grid-cols-12 gap-4 w-full">
                    {/* Left: Fastest Lap + Driver Standings */}
                    <div className="col-span-3 flex flex-col gap-4">
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

                        {/* Championship Standings */}
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
                                                index === 2 ? 'bg-[#CD7F32]/10' :
                                                    ''
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
                    </div>

                    {/* Center: Next Session + Constructor Standings */}
                    <div className="col-span-6 flex flex-col gap-4">
                        <div className="rounded-xl border border-[#FF4A4A]/30 bg-gradient-to-br from-[#9A1A1A] to-[#C72C2C] w-full h-40 flex flex-col shadow-lg shadow-red-900/20">
                            <div className="rounded-t-xl bg-[#B71C1C] text-white text-lg font-bold px-4 py-2">
                                {selectedTrack && selectedSession ? `${selectedTrack.toUpperCase()} - ${selectedSession.toUpperCase()}` : 'Select Session'}
                            </div>
                            {isLoadingResults ? (
                                <div className="flex-1 flex items-center justify-center text-white">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                </div>
                            ) : sessionResults.length > 0 ? (
                                <div className="flex-1 flex flex-col justify-center items-center">
                                    <div className="text-white text-2xl font-bold mb-2">Session Results</div>
                                    <div className="text-white/80 text-lg">
                                        {sessionResults.length} Drivers Completed
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-white">No data available</div>
                            )}
                        </div>
                        <div className="rounded-xl border border-[#4AFF4A]/30 bg-gradient-to-br from-[#1A4A1A] to-[#2A6A2A] min-h-[200px] p-0 flex flex-col shadow-lg shadow-green-900/20">
                            <div className="rounded-t-xl bg-[#2A8A2A] text-white text-base font-bold px-4 py-2">Constructor Standings</div>
                            {isLoadingResults ? (
                                <div className="flex-1 flex items-center justify-center text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4AFF4A]"></div>
                                </div>
                            ) : sessionResults.length > 0 ? (
                                <div className="flex-1 p-4">
                                    {Array.from(new Set(sessionResults.map(r => r.team.teamId))).map((teamId, index) => {
                                        const teamResults = sessionResults.filter(r => r.team.teamId === teamId);
                                        const bestPosition = Math.min(...teamResults.map(r => r.position));
                                        return (
                                            <div key={teamId} className={`flex items-center justify-between py-2 border-b border-[#3A7A3A]/30 last:border-0 ${index === 0 ? 'bg-[#FFD700]/10' :
                                                index === 1 ? 'bg-[#C0C0C0]/10' :
                                                    index === 2 ? 'bg-[#CD7F32]/10' :
                                                        ''
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 font-bold ${index === 0 ? 'text-[#FFD700]' :
                                                        index === 1 ? 'text-[#C0C0C0]' :
                                                            index === 2 ? 'text-[#CD7F32]' :
                                                                'text-gray-400'
                                                        }`}>{index + 1}</span>
                                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${index === 0 ? 'bg-[#FFD700]/30' :
                                                        index === 1 ? 'bg-[#C0C0C0]/30' :
                                                            index === 2 ? 'bg-[#CD7F32]/30' :
                                                                'bg-[#3A7A3A]'
                                                        }`}>
                                                        <span className="text-xs text-white">{teamId.substring(0, 2).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-white">{teamResults[0].team.teamName}</span>
                                                </div>
                                                <span className="text-gray-400">Best: P{bestPosition}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400">No data available</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Session Results Table */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div className="rounded-xl border border-[#FF9A4A]/30 bg-gradient-to-br from-[#4A2A1A] to-[#6A3A2A] min-h-[200px] p-0 flex flex-col shadow-lg shadow-orange-900/20">
                            <div className="rounded-t-xl bg-[#8A4A2A] text-white text-base font-bold px-4 py-2">Session Results</div>
                            {isLoadingResults ? (
                                <div className="flex-1 flex items-center justify-center text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF9A4A]"></div>
                                </div>
                            ) : sessionResults.length > 0 ? (
                                <div className="flex-1 p-4">
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
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400">No data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
