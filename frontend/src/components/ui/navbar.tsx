import React, { useEffect, useState, useRef } from 'react'
import { Home, Users, Calendar, LogIn, User } from "lucide-react"
import Link from 'next/link'

export default function Navbar() {
    // Backend URL for Auth0 login
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const auth0LoginUrl = `${backendUrl}/auth/login`

    const [user, setUser] = useState<any>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [imageError, setImageError] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const accessToken = typeof window !== "undefined" ? localStorage.getItem('access_token') : null
            if (!accessToken) {
                setUser(null)
                return
            }
            try {
                const res = await fetch(`${backendUrl}/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.auth0Profile || data.user)
                    setImageError(false) // Reset image error state when user data changes
                } else {
                    setUser(null)
                }
            } catch (err) {
                setUser(null)
            }
        }
        fetchUser()
    }, [backendUrl])

    // Handle click outside dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [dropdownOpen])

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('id_token')
        setUser(null)
        setDropdownOpen(false)
        window.location.href = '/'
    }

    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <nav className="bg-[#111111] border-b border-gray-800 py-3 px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center text-gray-300 hover:text-white">
                        <Home className="h-4 w-4 mr-2" />
                        <span className="text-sm">Home</span>
                    </Link>
                    <Link href="/teams" className="flex items-center text-gray-300 hover:text-white">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">Teams and Drivers</span>
                    </Link>
                    <Link href="/schedule" className="flex items-center text-gray-300 hover:text-white">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">Schedule</span>
                    </Link>
                </div>
                <div>
                    {user ? (
                        <div className="relative flex items-center space-x-3" ref={dropdownRef}>
                            <span className="text-gray-300 text-sm">{user.name || user.email}</span>
                            {user.picture && !imageError ? (
                                <img
                                    src={user.picture}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border border-gray-700 cursor-pointer object-cover"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    onError={handleImageError}
                                />
                            ) : (
                                <div 
                                    className="w-8 h-8 rounded-full border border-gray-700 cursor-pointer bg-gray-800 flex items-center justify-center"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                            )}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-12 w-40 bg-[#222] rounded shadow-lg border border-gray-700 z-50">
                                    <Link
                                        href="/settings"
                                        className="block px-4 py-2 text-gray-200 hover:bg-gray-800"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        User Settings
                                    </Link>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-800"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href={auth0LoginUrl} className="flex items-center text-gray-300 hover:text-white">
                            <LogIn className="h-4 w-4 mr-2" />
                            <span className="text-sm">Login/Sign up</span>
                        </a>
                    )}
                </div>
            </div>
        </nav>
    )
}