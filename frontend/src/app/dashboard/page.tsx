"use client"

import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Navbar from "@/components/ui/navbar"

// Mock data for demonstration
const MOCK_DRIVERS = [
    { position: 1, code: "VER", time: "1:30.123" },
    { position: 2, code: "HAM", time: "1:30.456" },
    { position: 3, code: "PER", time: "1:30.789" },
    { position: 4, code: "RUS", time: "1:31.012" },
    { position: 5, code: "SAI", time: "1:31.234" },
    { position: 6, code: "LEC", time: "1:31.345" },
    { position: 7, code: "NOR", time: "1:31.456" },
    { position: 8, code: "RIC", time: "1:31.567" },
    { position: 9, code: "GAS", time: "1:31.678" },
    { position: 10, code: "ALO", time: "1:31.789" },
    { position: 11, code: "OCO", time: "1:31.890" },
    { position: 12, code: "STR", time: "1:32.001" },
    { position: 13, code: "HUL", time: "1:32.112" },
    { position: 14, code: "MAG", time: "1:32.223" },
    { position: 15, code: "BOT", time: "1:32.334" },
    { position: 16, code: "ZHO", time: "1:32.445" },
    { position: 17, code: "TSU", time: "1:32.556" },
    { position: 18, code: "ALB", time: "1:32.667" },
    { position: 19, code: "SAR", time: "1:32.778" },
    { position: 20, code: "DEV", time: "1:32.889" }
]

// Add this to your mock data
const MOCK_DRIVER_CARDS = [
    {
        name: "Albon",
        team: "Williams",
        teamColor: "bg-blue-600",
        logoUrl: "/team-logos/williams.png",
        imageUrl: "/drivers/albon.png"
    },
    {
        name: "Gasly",
        team: "Alpine",
        teamColor: "bg-blue-500",
        logoUrl: "/team-logos/alpine.png",
        imageUrl: "/drivers/gasly.png"
    },
    {
        name: "Hector",
        team: "Red Bull",
        teamColor: "bg-blue-800",
        logoUrl: "/team-logos/redbull.png",
        imageUrl: "/drivers/hector.png"
    }
]

export default function RaceDashboard() {
    const [selectedSeason, setSelectedSeason] = useState<string>("")
    const [selectedTrack, setSelectedTrack] = useState<string>("")
    const [selectedSession, setSelectedSession] = useState<string>("")

    return (
        <div className="flex flex-col bg-black min-h-screen text-white">
            {/* Navigation Bar */}
            <Navbar />

            <div className="flex flex-col gap-8 p-8">
                {/* Selection Controls */}
                <div className="grid grid-cols-3 gap-12 px-6 py-8">
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="bg-gray-800 text-white border-none h-12 text-base px-6 rounded-lg">
                            <SelectValue placeholder="Select Season" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border border-gray-700">
                            <SelectItem value="2023" className="text-base py-2">2023</SelectItem>
                            <SelectItem value="2022" className="text-base py-2">2022</SelectItem>
                            <SelectItem value="2021" className="text-base py-2">2021</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                        <SelectTrigger className="bg-gray-800 text-white border-none h-12 text-base px-6 rounded-lg">
                            <SelectValue placeholder="Select Track" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border border-gray-700">
                            <SelectItem value="miami" className="text-base py-2">Miami</SelectItem>
                            <SelectItem value="monaco" className="text-base py-2">Monaco</SelectItem>
                            <SelectItem value="silverstone" className="text-base py-2">Silverstone</SelectItem>
                            <SelectItem value="monza" className="text-base py-2">Monza</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                        <SelectTrigger className="bg-gray-800 text-white border-none h-12 text-base px-6 rounded-lg">
                            <SelectValue placeholder="Select Session" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border border-gray-700">
                            <SelectItem value="fp1" className="text-base py-2">Practice 1</SelectItem>
                            <SelectItem value="fp2" className="text-base py-2">Practice 2</SelectItem>
                            <SelectItem value="fp3" className="text-base py-2">Practice 3</SelectItem>
                            <SelectItem value="qualifying" className="text-base py-2">Qualifying</SelectItem>
                            <SelectItem value="race" className="text-base py-2">Race</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Race Information */}
                <div className="grid grid-cols-12 gap-8 mt-6">
                    {/* Left Section */}
                    <div className="col-span-8 grid grid-cols-2 gap-8">
                        {/* Driver Cards */}
                        <div className="col-span-2 flex gap-6 mb-8">
                            {MOCK_DRIVER_CARDS.map((driver, index) => (
                                <div key={index} className="w-full bg-[#111827] rounded-lg overflow-hidden border border-gray-800 relative h-52">
                                    <div className="bg-blue-600 h-1 w-full"></div>
                                    <div className="p-4">
                                        <div className="text-xl font-bold mb-2">{driver.name}</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800">
                                                <img src={driver.logoUrl} alt={`${driver.team} logo`} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-sm text-gray-400">{driver.team}</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 h-full w-1/2 flex justify-end items-end">
                                        <img
                                            src={driver.imageUrl}
                                            alt={`${driver.name}`}
                                            className="h-4/5 object-contain"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Race Title - Now positioned second */}
                        <div className="col-span-2 flex w-full mb-8">
                            {/* Left panel - Fastest Lap */}
                            <div className="bg-[#1e0066] text-white py-3 px-6 rounded-l-md flex-1 flex flex-col justify-center">
                                <div className="text-sm uppercase font-bold text-[#9370DB]">FASTEST LAP</div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Driver</span>
                                    <span>Lap Time</span>
                                </div>
                            </div>
                            
                            {/* Right panel - Race Info */}
                            <div className="bg-[#8B0000] text-white py-3 px-6 rounded-r-md flex-1 flex items-center justify-between">
                                <div className="font-bold">R5 - Miami Practice 1</div>
                                <div className="flex items-center">
                                    <img src="/f1-logo.svg" alt="F1 Logo" className="h-5 mr-2" />
                                    <span>05days 03hrs 44mins 45sec</span>
                                </div>
                            </div>
                        </div>

                        {/* Driver Standings */}
                        <Card className="bg-transparent border border-gray-700 rounded-lg">
                            <CardHeader className="bg-indigo-900 text-white py-5 px-8">
                                <CardTitle className="text-lg flex justify-between items-center">
                                    <span>Driver</span>
                                    <span>Lap Time</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-64 overflow-auto">
                                    <h3 className="text-lg font-bold mb-4">2023 Driver Standings</h3>
                                    {/* Driver standings content would go here */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Constructor Standings */}
                        <Card className="bg-transparent border border-gray-700 rounded-lg">
                            <CardHeader className="bg-indigo-900 text-white py-5 px-8">
                                <CardTitle className="text-lg flex justify-between items-center">
                                    <span>Constructor</span>
                                    <span>Standings</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-64 overflow-auto">
                                    <h3 className="text-lg font-bold mb-4">2023 Constructor Standings</h3>
                                    {/* Constructor standings content would go here */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lap Chart */}
                        <Card className="col-span-2 bg-transparent border border-gray-700 rounded-lg mt-4">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">Laps Chart</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="h-40 flex items-center justify-center">
                                    {/* Lap chart visualization would go here */}
                                    <p className="text-gray-400">Lap chart visualization</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tire Strategy */}
                        <Card className="col-span-2 bg-transparent border border-gray-700 rounded-lg mt-4">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">Tyre Strategy</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="h-72 flex items-center justify-center">
                                    {/* Tire strategy visualization would go here */}
                                    <p className="text-gray-400">Tire strategy visualization</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Section - Driver Positions Table */}
                    <div className="col-span-4">
                        <Card className="bg-transparent border border-gray-700 rounded-lg overflow-hidden">
                            <CardHeader className="p-0">
                                <div className="grid grid-cols-3 text-center text-sm font-medium py-2 bg-[#2d2d2d] text-white">
                                    <div>Pos</div>
                                    <div>Driver</div>
                                    <div>Time</div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[650px] overflow-auto bg-[#1e1e1e]">
                                    {MOCK_DRIVERS.map((driver, index) => (
                                        <div
                                            key={driver.position}
                                            className={`grid grid-cols-3 text-center py-2 ${index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#262626]'} text-white`}
                                        >
                                            <div>{driver.position}</div>
                                            <div className="font-bold">{driver.code}</div>
                                            <div>{driver.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}