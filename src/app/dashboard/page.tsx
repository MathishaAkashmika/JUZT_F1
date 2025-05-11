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
    Season,
    Track,
    Session,
    SessionResult
} from '@/lib/f1-api'
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

    // Fetch seasons from the API instead of generating years locally
    useEffect(() => {
        getAvailableSeasons().then(res => {
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

        getTracks(selectedSeason).then(res => {
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

        getRaceSessions(selectedSeason, track.id.toString()).then(res => {
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

        getSessionResults(selectedSeason, track.round.toString(), selectedSession).then(res => {
            setIsLoadingResults(false)
            if (res.error) {
                setError(res.error.message)
                return
            }
            setSessionResults(res.data)
        })
    }, [selectedSession, selectedTrack, selectedSeason, tracks])

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
        <div className="min-h-screen bg-black text-white font-mono tracking-wide">
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
                        <SelectTrigger className="w-40 rounded-xl bg-neutral-900 border border-neutral-700 text-base py-2.5 px-4 font-mono flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-600">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-700 border border-neutral-500 rounded-xl text-lg font-bold text-gray-200">
                            {seasons.map((season) => (
                                <SelectItem
                                    key={season.year}
                                    value={season.year.toString()}
                                    className="hover:bg-neutral-600 focus:bg-neutral-600 rounded-full px-4 py-2 transition-all"
                                >
                                    {season.year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedTrack} onValueChange={setSelectedTrack} disabled={isLoadingTracks || !selectedSeason}>
                        <SelectTrigger className="w-64 rounded-xl bg-neutral-900 border border-neutral-700 text-base py-2.5 px-4 font-mono flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-600">
                            <SelectValue placeholder={isLoadingTracks ? "Loading..." : "Track"} />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-700 border border-neutral-500 rounded-xl text-lg font-bold text-gray-200">
                            {tracks.map((track) => (
                                <SelectItem
                                    key={track.id}
                                    value={track.circuit.toLowerCase()}
                                    className="hover:bg-neutral-600 focus:bg-neutral-600 rounded-full px-4 py-2 transition-all"
                                >
                                    {track.circuit} ({track.country})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedSession} onValueChange={setSelectedSession} disabled={isLoadingSessions || !selectedTrack}>
                        <SelectTrigger className="w-40 rounded-xl bg-neutral-900 border border-neutral-700 text-base py-2.5 px-4 font-mono flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-600">
                            <SelectValue placeholder={isLoadingSessions ? "Loading..." : "Session"} />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-700 border border-neutral-500 rounded-xl text-lg font-bold text-gray-200">
                            {sessions.map((session) => (
                                <SelectItem
                                    key={session.id}
                                    value={session.type}
                                    className="hover:bg-neutral-600 focus:bg-neutral-600 rounded-full px-4 py-2 transition-all"
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
                        <div className="col-span-3 text-center text-gray-400 py-8">Loading results...</div>
                    ) : sessionResults.length > 0 ? (
                        sessionResults.slice(0, 3).map((result, idx) => (
                            <div
                                key={result.driver.driverId}
                                className={`relative rounded-xl border bg-neutral-900 flex items-end h-24 overflow-hidden cursor-pointer transition-all duration-150 ${selectedDriver === idx ? 'border-2 border-blue-500' : 'border border-neutral-700'}`}
                                onClick={() => setSelectedDriver(idx)}
                            >
                                {/* Car image as background */}
                                <img src={`/cars/${result.team.teamId}.png`} alt="car" className="absolute left-0 top-0 h-full w-full object-cover opacity-90" style={{ zIndex: 1 }} />
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
                                        <img src={`/team-logos/${result.team.teamId}.png`} alt="team logo" className="h-6 w-6 object-contain mt-2" />
                                    </div>
                                    <div className="flex items-end h-full">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden border-2 border-white bg-black/60 flex items-end justify-end">
                                            <img src={`/drivers/${result.driver.shortName.toLowerCase()}.png`} alt="driver" className="h-full w-full object-contain" />
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
                        <div className="rounded-xl border border-neutral-700 bg-gradient-to-br from-purple-900 to-purple-700 w-full h-40 flex flex-col">
                            <div className="rounded-t-xl bg-purple-800 text-white text-xs font-bold px-4 py-2 tracking-widest">FASTEST LAP</div>
                            <div className="flex justify-between items-center px-6 py-4 text-lg">
                                <span>Driver</span>
                                <span>Lap Time</span>
                            </div>
                        </div>
                        <div className="rounded-xl border border-neutral-700 bg-neutral-900 min-h-[200px] p-0 flex flex-col">
                            <div className="rounded-t-xl bg-neutral-800 text-white text-base font-bold px-4 py-2">2025 Driver Standings</div>
                        </div>
                    </div>
                    {/* Center: Next Session + Constructor Standings */}
                    <div className="col-span-6 flex flex-col gap-4">
                        <div className="rounded-xl border border-neutral-700 bg-gradient-to-br from-red-900 to-red-700 w-full h-40 flex flex-col">
                            <div className="rounded-t-xl bg-red-800 text-white text-lg font-bold px-4 py-2">R6 - Miami Practice 1</div>
                            <div className="text-center text-2xl font-bold py-4">08days 03hrs 44mins 45sec</div>
                        </div>
                        <div className="rounded-xl border border-neutral-700 bg-neutral-900 min-h-[200px] p-0 flex flex-col">
                            <div className="rounded-t-xl bg-neutral-800 text-white text-base font-bold px-4 py-2">2025 Constructor Standings</div>
                        </div>
                    </div>
                    {/* Right: Session Results Table */}
                    <div className="col-span-3 flex flex-col">
                        <div className="flex justify-between px-4 py-2 bg-neutral-800 text-white text-base font-bold rounded-full mb-2">
                            <span>Pos</span>
                            <span>Driver</span>
                            <span>Time</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="driver-tree">
                                {topDrivers.map((result, idx) => (
                                    <div key={result.driverId} className="driver-box">
                                        <img src={result.driver?.imageUrl || '/default-driver.png'} alt={result.driver?.name} />
                                        <div>{result.driver?.name} {result.driver?.surname}</div>
                                        <div>{result.team?.teamName}</div>
                                        <div>{result.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="rounded-xl border border-neutral-700 bg-neutral-900 min-h-[200px] mt-4 p-0 w-full flex flex-col">
                    <div className="rounded-t-xl bg-neutral-800 text-white text-base font-bold px-4 py-2">Laps Chart</div>
                </div>
                <div className="rounded-xl border border-neutral-700 bg-neutral-900 min-h-[200px] mt-4 p-0 w-full flex flex-col">
                    <div className="rounded-t-xl bg-neutral-800 text-white text-base font-bold px-4 py-2">Tyre Strategy</div>
                </div>
            </div>
        </div>
    )
}
