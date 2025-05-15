import axios from 'axios';
import { Season, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL } from './utils';

export const getAvailableSeasons = async (): Promise<{ data: Season[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/seasons`);
        const seasons = response.data.championships.map((championship: any) => ({
            year: championship.year,
            totalRaces: 0, // This information is not available in the new API
            champion: undefined // This information is not available in the new API
        }));
        return { data: seasons };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};