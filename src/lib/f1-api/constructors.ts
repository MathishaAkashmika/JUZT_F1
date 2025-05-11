import axios from 'axios';
import { Constructor, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL } from './utils';

export const getConstructorStandings = async (year: string): Promise<{ data: Constructor[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/constructors`);
        const constructors = response.data.data.map((constructor: any) => ({
            id: constructor.id,
            name: constructor.name,
            color: constructor.color || '#000000',
            logoUrl: `/team-logos/${constructor.name.toLowerCase()}.png`,
            points: constructor.points,
            position: constructor.position,
        }));
        return { data: constructors };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};