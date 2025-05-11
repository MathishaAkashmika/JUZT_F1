import axios from 'axios';
import { Race, handleApiError, ApiResponse, RaceResponse } from './types';
import { F1_API_BASE_URL } from './utils';

export const getRacesByYear = async (year: string): Promise<ApiResponse<Race[]>> => {
    try {
        const response = await axios.get<{ races: RaceResponse[] }>(`${F1_API_BASE_URL}/${year}/races`);

        // Transform the API response to match our Race interface
        const races: Race[] = response.data.races.map((race: RaceResponse) => ({
            id: race.id,
            name: race.name,
            circuit: race.circuit,
            date: race.date,
            country: race.country,
            round: race.round,
            sessions: undefined // Will be populated by getRaceSessions if needed
        }));

        return { data: races };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};