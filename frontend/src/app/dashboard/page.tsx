"use client"

import React, { useState, useEffect } from 'react'
import Navbar from "@/components/ui/navbar"
import {
    getAvailableSeasons,
    getTracks,
    getRaceSessions,
    getSessionResults,
    getDriverStandings,
    getConstructorChampionship,
    Season,
    Track,
    Session,
    SessionResult,
    Driver,
    ConstructorChampionship,
    ApiError
} from '../../lib/f1-api'

// Import components
import SeasonSelector from '@/components/dashboard/SeasonSelector'
import DriverHighlightCards from '@/components/dashboard/DriverHighlightCards'
import FastestLapPanel from '@/components/dashboard/FastestLapPanel'
import DriverStandingsPanel from '@/components/dashboard/DriverStandingsPanel'
import SessionInfoPanel from '@/components/dashboard/SessionInfoPanel'
import ConstructorStandingsPanel from '@/components/dashboard/ConstructorStandingsPanel'
import SessionResultsPanel from '@/components/dashboard/SessionResultsPanel'
import SessionDetails from '@/components/SessionDetails'
import '@/styles/LapChart.css' // Add this import for LapChart styling

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
    const [sessionResults, setSessionResults] = useState<SessionResult[]>([])
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const [driverStandings, setDriverStandings] = useState<Driver[]>([])
    const [isLoadingDriverStandings, setIsLoadingDriverStandings] = useState(false)
    const [constructorStandings, setConstructorStandings] = useState<ConstructorChampionship[]>([])
    const [isLoadingConstructorStandings, setIsLoadingConstructorStandings] = useState(false)

    // State to track the current session object for SessionDetails
    const [currentSession, setCurrentSession] = useState<Session | null>(null);

    // Fetch seasons from the API
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

    // Fetch constructor standings when season changes
    useEffect(() => {
        if (!selectedSeason) return
        setConstructorStandings([])
        setError(null)
        setIsLoadingConstructorStandings(true)

        getConstructorChampionship(selectedSeason).then((res: { data: ConstructorChampionship[]; error?: ApiError }) => {
            setIsLoadingConstructorStandings(false)
            if (res.error) {
                setError(res.error.message)
                return
            }
            setConstructorStandings(res.data)
        })
    }, [selectedSeason])

    // Update currentSession when selectedSession changes
    useEffect(() => {
        if (!selectedSession || sessions.length === 0) {
            setCurrentSession(null);
            return;
        }

        const sessionObject = sessions.find(s => s.id === selectedSession);
        setCurrentSession(sessionObject || null);
    }, [selectedSession, sessions]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A] text-white font-mono tracking-wide">
            <Navbar />
            <div className="w-full flex flex-col items-center gap-4 py-8 px-4">
                {/* Page title with year */}
                <h1 className="text-2xl font-bold text-white mb-2">
                    {selectedSeason ? `Formula 1 Dashboard - ${selectedSeason} Season` : 'Formula 1 Dashboard'}
                </h1>

                {/* Error message */}
                {error && (
                    <div className="w-full bg-red-900/50 border border-red-500 text-white px-4 py-2 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Season, Track and Session Selectors */}
                <SeasonSelector
                    seasons={seasons}
                    tracks={tracks}
                    sessions={sessions}
                    selectedSeason={selectedSeason}
                    selectedTrack={selectedTrack}
                    selectedSession={selectedSession}
                    setSelectedSeason={setSelectedSeason}
                    setSelectedTrack={setSelectedTrack}
                    setSelectedSession={setSelectedSession}
                    isLoadingTracks={isLoadingTracks}
                    isLoadingSessions={isLoadingSessions}
                />

                {/* Session Details Panel with Lap Chart */}
                {currentSession && (
                    <div className="w-full bg-[#1E1E2E]/60 border border-gray-800 rounded-xl p-4 mb-4">
                        <h2 className="text-xl font-bold mb-3 text-blue-300">Session Details</h2>
                        <SessionDetails session={currentSession} />
                    </div>
                )}

                {/* Driver Highlight Cards */}
                <DriverHighlightCards
                    sessionResults={sessionResults}
                    isLoadingResults={isLoadingResults}
                    selectedDriver={selectedDriver}
                    setSelectedDriver={setSelectedDriver}
                />

                {/* Top Panels + Standings Stacked */}
                <div className="grid grid-cols-12 gap-4 w-full">
                    {/* Left: Fastest Lap + Driver Standings */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <FastestLapPanel
                            sessionResults={sessionResults}
                            isLoadingResults={isLoadingResults}
                        />

                        <DriverStandingsPanel
                            driverStandings={driverStandings}
                            isLoadingDriverStandings={isLoadingDriverStandings}
                            selectedSeason={selectedSeason}
                        />
                    </div>

                    {/* Center: Session Info + Constructor Standings */}
                    <div className="col-span-6 flex flex-col gap-4">
                        <SessionInfoPanel
                            selectedTrack={selectedTrack}
                            selectedSession={selectedSession}
                            sessionResults={sessionResults}
                            isLoadingResults={isLoadingResults}
                        />

                        <ConstructorStandingsPanel
                            constructorStandings={constructorStandings}
                            isLoadingConstructorStandings={isLoadingConstructorStandings}
                            selectedSeason={selectedSeason}
                        />
                    </div>

                    {/* Right: Session Results */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <SessionResultsPanel
                            sessionResults={sessionResults}
                            isLoadingResults={isLoadingResults}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
