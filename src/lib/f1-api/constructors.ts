import axios from 'axios';
import { Constructor, handleApiError, ConstructorChampionshipResponse, ApiResponse, ConstructorResponse, ConstructorChampionship } from './types';
import { F1_API_BASE_URL } from './utils';

export const getConstructorDetails = async (constructorId: string): Promise<ApiResponse<Constructor>> => {
    try {
        const response = await axios.get<{ constructors: ConstructorResponse[] }>(`${F1_API_BASE_URL}/constructors/${constructorId}`);
        const constructorData = response.data.constructors[0];

        return {
            data: {
                ...constructorData,
                logoUrl: `/constructors/${constructorData.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            }
        };
    } catch (error) {
        return { data: {} as Constructor, error: handleApiError(error) };
    }
};

export const getCurrentConstructors = async (): Promise<ApiResponse<Constructor[]>> => {
    try {
        const response = await axios.get<{ constructors: ConstructorResponse[] }>(`${F1_API_BASE_URL}/current/constructors`);

        const constructors = await Promise.all(
            response.data.constructors.map(async (constructor: ConstructorResponse) => {
                const details = await getConstructorDetails(constructor.id.toString());
                return {
                    ...details.data,
                    logoUrl: `/constructors/${constructor.name.toLowerCase().replace(/\s+/g, '-')}.png`,
                };
            })
        );
        return { data: constructors };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getConstructorChampionship = async (year: string): Promise<ApiResponse<ConstructorChampionship[]>> => {
    try {
        const response = await axios.get<ConstructorChampionshipResponse>(`${F1_API_BASE_URL}/${year}/constructors-championship`);

        // Transform the API response to match our ConstructorChampionship interface
        const constructors: ConstructorChampionship[] = response.data.constructors_championship.map((standing) => ({
            id: standing.teamId,
            name: standing.team.teamName,
            points: standing.points,
            position: standing.position,
            wins: standing.wins,
            country: standing.team.country,
            color: getTeamColor(standing.teamId)
        }));

        return { data: constructors };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

// Helper function to get team colors
function getTeamColor(teamId: string): string {
    const teamColors: { [key: string]: string } = {
        mercedes: '#00D2BE',
        red_bull: '#0600EF',
        ferrari: '#DC0000',
        mclaren: '#FF8700',
        alpine: '#0090FF',
        alphatauri: '#2B4562',
        aston_martin: '#006F62',
        williams: '#005AFF',
        alfa: '#900000',
        haas: '#FFFFFF',
        alpha_tauri: '#2B4562',
        alfa_romeo: '#900000',
        racing_point: '#F596C8',
        renault: '#FFF500',
        toro_rosso: '#469BFF',
        sauber: '#9B0000',
        force_india: '#F596C8',
        lotus: '#000000',
        manor: '#323232',
        caterham: '#005030',
        marussia: '#6E0000',
        hrt: '#888888'
    };

    return teamColors[teamId] || '#000000';
}