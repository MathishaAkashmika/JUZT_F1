import axios from 'axios';
import { Race, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL } from './utils';

// Define interface for API race data
interface ApiRaceData {
    id: number;
    name: string;
    circuit: string;
    date: string;
    country: string;
    round: number;
}

export const getRaces = async (year: string): Promise<{ data: Race[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/races`);
        const races = response.data.data.map((race: ApiRaceData) => ({
            id: race.id,
            name: race.name,
            circuit: race.circuit,
            date: race.date,
            country: race.country,
            round: race.round,
        }));
        return { data: races };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};