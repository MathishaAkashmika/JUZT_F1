import axios from 'axios';
import { Season, handleApiError, ApiResponse, SeasonResponse } from './types';
import { F1_API_BASE_URL } from './utils';

export const getSeasons = async (): Promise<ApiResponse<Season[]>> => {
    try {
        const response = await axios.get<{ seasons: SeasonResponse[] }>(`${F1_API_BASE_URL}/seasons`);

        // Transform the API response to match our Season interface
        const seasons: Season[] = response.data.seasons.map((season: SeasonResponse) => ({
            year: season.year,
            totalRaces: season.totalRaces,
            champion: season.champion
        }));

        return { data: seasons };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};