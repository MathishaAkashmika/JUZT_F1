import { AxiosError } from 'axios';

export interface Driver {
    driverId: string;
    name: string;
    surname: string;
    nationality: string;
    birthday: string;
    number: number;
    shortName: string;
    url: string;
    team?: string;
    teamColor?: string;
    imageUrl?: string;
    position?: number;
    points?: number;
    wins?: number;
}

export interface OpenF1Driver {
    driver_number: number;
    broadcast_name: string;
    full_name: string;
    name_acronym: string;
    team_name: string;
    team_colour: string;
    first_name: string;
    last_name: string;
    headshot_url: string;
    country_code: string;
    session_key: number;
    meeting_key: number;
}

export interface Constructor {
    id: number;
    name: string;
    color: string;
    logoUrl: string;
    points?: number;
    position?: number;
}

export interface ConstructorChampionship {
    id: string;
    name: string;
    points: number;
    position: number;
    wins: number;
    country: string;
    color: string;
}

export interface Race {
    id: number;
    name: string;
    circuit: string;
    date: string;
    country: string;
    round: number;
    sessions?: Session[];
}

export interface Session {
    id: string;
    type: string;
    date: string;
    time: string;
    status: 'upcoming' | 'live' | 'completed';
    session_key?: number | null;
}

export interface Track {
    id: number;
    name: string;
    circuit: string;
    country: string;
    city: string;
    length: number;
    laps: number;
    firstGrandPrix: number;
    round: number;
    lapRecord: {
        time: string;
        driver: string;
        year: number;
    };
}

export interface ApiError {
    message: string;
    status: number;
}

export interface Season {
    year: number;
    totalRaces: number;
    champion?: {
        driverId: string;
        name: string;
        surname: string;
        team: string;
    };
}

export interface SessionResult {
    driver: {
        driverId: string;
        name: string;
        surname: string;
        shortName: string;
        number: number;
        nationality: string;
        imageUrl?: string;
    };
    team: {
        teamId: string;
        teamName: string;
        nationality: string;
    };
    time: string;
    position: number;
    points?: number;
    gridPosition?: number;
}

// Type for API error handling
export type ApiErrorType = Error | AxiosError | unknown;

export const handleApiError = (error: ApiErrorType): ApiError => {
    if ((error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError;
        return {
            message: (axiosError.response?.data as { message?: string })?.message || 'An error occurred while fetching data',
            status: axiosError.response?.status || 500
        };
    }
    return {
        message: 'An unexpected error occurred',
        status: 500
    };
};