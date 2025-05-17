import axios from 'axios';
import { Constructor, ApiError, handleApiError, ConstructorChampionship } from './types';
import { F1_API_BASE_URL } from './utils';

export const getConstructorStandings = async (year: string): Promise<{ data: Constructor[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/constructors`);
        const constructors = response.data.data.map((constructor: { id: number; name: string; color?: string; points?: number; position?: number }) => ({
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

export const getConstructorChampionship = async (year: string): Promise<{ data: ConstructorChampionship[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/constructors-championship`);
        const constructors = response.data.constructors_championship.map((constructor: {
            teamId: string;
            team: { teamName: string; country: string };
            points: number;
            position: number;
            wins: number
        }) => ({
            id: constructor.teamId,
            name: constructor.team.teamName,
            points: constructor.points,
            position: constructor.position,
            wins: constructor.wins,
            country: constructor.team.country,
            color: getTeamColor(constructor.teamId)
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