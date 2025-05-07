import React from 'react'
import { Home, Users, Calendar, LogIn } from "lucide-react"
import Link from 'next/link'

export default function Navbar() {
    // Backend URL for Auth0 login
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const auth0LoginUrl = `${backendUrl}/auth/login`

    return (
        <nav className="bg-[#111111] border-b border-gray-800 py-3 px-4">
            <div className="flex items-center justify-start space-x-8">
                <a href={auth0LoginUrl} className="flex items-center text-gray-300 hover:text-white">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="text-sm">Login/Sign up</span>
                </a>
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
        </nav>
    )
}