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
import LapChart from '@/components/LapChart'
import TyreStrategyPanel from '@/components/dashboard/TyreStrategyPanel'

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

    return (<div className="min-h-screen bg-gradient-to-b from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A] text-white font-mono tracking-wide">
        <Navbar />
        <div className="w-full flex flex-col items-center gap-4 py-4 sm:py-8 px-3 sm:px-4">
            {/* Page title with year */}
            <div className="relative w-full flex justify-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 mb-1 px-2">
                    {selectedSeason ? `Formula 1 Dashboard - ${selectedSeason} Season` : 'Formula 1 Dashboard'}
                </h1>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-0.5 w-32 bg-gradient-to-r from-cyan-600/0 via-cyan-400 to-cyan-600/0"></div>
            </div>

            {/* Error message */}
            {error && (
                <div className="w-full bg-red-900/30 border border-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg flex items-center text-sm sm:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
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

            {/* Driver Highlight Cards */}
            <DriverHighlightCards
                sessionResults={sessionResults}
                isLoadingResults={isLoadingResults}
                selectedDriver={selectedDriver}
                setSelectedDriver={setSelectedDriver}
            />

            {/* Responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                {/* Left: Fastest Lap + Driver Standings - Full width on mobile, 3 columns on desktop */}
                <div className="md:col-span-3 flex flex-col gap-4">
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

                {/* Center: Session Info + Constructor Standings - Full width on mobile, 6 columns on desktop */}
                <div className="md:col-span-6 flex flex-col gap-4">
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

                {/* Right: Session Results - Full width on mobile, 3 columns on desktop */}
                <div className="md:col-span-3 flex flex-col gap-4">
                    <SessionResultsPanel
                        sessionResults={sessionResults}
                        isLoadingResults={isLoadingResults}
                    />
                </div>
            </div>            {/* LapChart Component */}
            {currentSession?.session_key && (
                <div className="w-full mt-6 sm:mt-8 bg-[#1A1A2E] border border-gray-700 rounded-xl p-3 sm:p-6 shadow-xl overflow-x-auto">
                    <h3 className="text-xl font-semibold mb-4 text-cyan-300">Lap Time Comparison</h3>
                    <div className="min-w-[300px] overflow-x-auto">
                        <LapChart
                            sessionKey={currentSession.session_key}
                            height={400}
                        />
                    </div>
                </div>
            )}

            {/* Tyre Strategy Panel */}
            <TyreStrategyPanel
                sessionKey={currentSession?.session_key || null}
                isLoadingSession={isLoadingSessions}
            />
        </div>
    </div>
    )
}
