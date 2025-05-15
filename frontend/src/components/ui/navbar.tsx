import React, { useState } from 'react'
import { Home, Users, Calendar, Menu, X } from "lucide-react"
import Link from 'next/link'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16">
                    <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                            <Link href="/" className="text-white font-bold text-xl hover:text-gray-300 transition-colors duration-200">
                                JUZT F1
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-4">
                                <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 hover:bg-gray-800">
                                    <Home className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link href="/drivers" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 hover:bg-gray-800">
                                    <Users className="h-4 w-4 mr-2" />
                                    Drivers
                                </Link>
                                <Link href="/calendar" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 hover:bg-gray-800">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Calendar
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#111] border-b border-gray-800">
                        <Link href="/dashboard" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center hover:bg-gray-800 transition-colors duration-200">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Link>
                        <Link href="/drivers" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center hover:bg-gray-800 transition-colors duration-200">
                            <Users className="h-4 w-4 mr-2" />
                            Drivers
                        </Link>
                        <Link href="/calendar" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center hover:bg-gray-800 transition-colors duration-200">
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}