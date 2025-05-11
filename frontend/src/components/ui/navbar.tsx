import React from 'react'
import { Home, Users, Calendar } from "lucide-react"
import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className="bg-[#111] border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link href="/" className="text-white font-bold text-xl">
                                JUZT F1
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <Home className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link href="/drivers" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    Drivers
                                </Link>
                                <Link href="/calendar" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Calendar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}