import React, { useState, useEffect } from 'react'
import { Home, Users, Menu, X } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    // Close mobile menu when resizing to larger screen
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isOpen) {
                setIsOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isOpen])

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (isOpen && !target.closest('nav')) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    return (
        <nav className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">            <div className="max-w-7xl w-full px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center text-white hover:text-gray-300 transition-colors duration-200">
                            <Image
                                src="/JUZT_2.png"
                                alt="JUZT F1 Logo"
                                width={70}
                                height={32}
                                className="w-auto h-7 xs:h-8 sm:h-9"
                                priority
                            />
                        </Link>
                    </div>
                    <div className="hidden md:block ml-6">
                        <div className="flex items-baseline space-x-4">
                            <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 hover:bg-gray-800">
                                <Home className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link href="/drivers" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 hover:bg-gray-800">
                                <Users className="h-4 w-4 mr-2" />
                                Drivers
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
                        aria-expanded={isOpen}
                        aria-label="Toggle navigation"
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
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen
                    ? 'max-h-[500px] opacity-100'
                    : 'max-h-0 opacity-0'
                    }`}
            >                <div className="px-3 py-3 space-y-2 sm:px-4 bg-[#111] border-t border-gray-800 shadow-lg">
                    <Link
                        href="/dashboard"
                        className="text-gray-300 hover:text-white block px-4 py-3 rounded-md text-base font-medium flex items-center hover:bg-gray-800 transition-colors duration-200 active:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                    >
                        <Home className="h-5 w-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        href="/drivers"
                        className="text-gray-300 hover:text-white block px-4 py-3 rounded-md text-base font-medium flex items-center hover:bg-gray-800 transition-colors duration-200 active:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                    >
                        <Users className="h-5 w-5 mr-3" />
                        Drivers
                    </Link>
                </div>
            </div>
        </nav>
    )
}