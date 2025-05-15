import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Season, Track, Session } from '@/lib/f1-api';

interface SeasonSelectorProps {
    seasons: Season[];
    tracks: Track[];
    sessions: Session[];
    selectedSeason: string;
    selectedTrack: string;
    selectedSession: string;
    setSelectedSeason: (season: string) => void;
    setSelectedTrack: (track: string) => void;
    setSelectedSession: (session: string) => void;
    isLoadingTracks: boolean;
    isLoadingSessions: boolean;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
    seasons,
    tracks,
    sessions,
    selectedSeason,
    selectedTrack,
    selectedSession,
    setSelectedSeason,
    setSelectedTrack,
    setSelectedSession,
    isLoadingTracks,
    isLoadingSessions
}) => {
    return (
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
    );
};

export default SeasonSelector;
