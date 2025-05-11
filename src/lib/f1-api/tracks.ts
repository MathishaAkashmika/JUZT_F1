import axios from 'axios';
import { Track, handleApiError, ApiResponse, TrackResponse } from './types';
import { F1_API_BASE_URL } from './utils';

export const getTracksByYear = async (year: string): Promise<ApiResponse<Track[]>> => {
    try {
        const response = await axios.get<{ tracks: TrackResponse[] }>(`${F1_API_BASE_URL}/${year}/tracks`);

        // Transform the API response to match our Track interface
        const tracks: Track[] = response.data.tracks.map((track: TrackResponse) => ({
            id: track.id,
            name: track.name,
            circuit: track.circuit,
            country: track.country,
            city: track.city,
            length: track.length,
            laps: track.laps,
            firstGrandPrix: track.firstGrandPrix,
            round: track.round,
            lapRecord: track.lapRecord
        }));

        return { data: tracks };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};