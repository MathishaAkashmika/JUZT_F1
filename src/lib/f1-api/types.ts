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
    type: 'fp1' | 'fp2' | 'fp3' | 'qualifying' | 'race' | 'sprintQualy' | 'sprintRace';
    date: string;
    time: string;
    status: 'upcoming' | 'ongoing' | 'completed';
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
    status?: number;
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

export interface DriverChampionshipResponse {
    api: string;
    url: string;
    limit: number;
    offset: number;
    total: number;
    season: string;
    championshipId: string;
    drivers_championship: Array<{
        classificationId: number;
        driverId: string;
        teamId: string;
        points: number;
        position: number;
        wins: number | null;
        driver: {
            name: string;
            surname: string;
            nationality: string;
            birthday: string;
            number: number;
            shortName: string;
            url: string;
        };
        team: {
            teamId: string;
            teamName: string;
            country: string;
            firstAppareance: number;
            constructorsChampionships: number | null;
            driversChampionships: number | null;
            url: string;
        };
    }>;
}

export interface ApiResponse<T> {
    data: T;
    error?: ApiError;
}

export interface ApiErrorResponse {
    message: string;
    status?: number;
}

export interface DriverResponse {
    driverId: string;
    name: string;
    surname: string;
    nationality: string;
    birthday: string;
    number: number;
    shortName: string;
    url: string;
    teamId?: string;
    teamColor?: string;
}

export interface ConstructorResponse {
    id: number;
    name: string;
    color: string;
    points?: number;
    position?: number;
}

export interface RaceResponse {
    id: number;
    name: string;
    circuit: string;
    date: string;
    country: string;
    round: number;
}

export interface TrackResponse {
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

export interface SeasonResponse {
    year: number;
    totalRaces: number;
    champion?: {
        driverId: string;
        name: string;
        surname: string;
        team: string;
    };
}

export interface SessionResponse {
    id: string;
    type: 'fp1' | 'fp2' | 'fp3' | 'qualifying' | 'race' | 'sprintQualy' | 'sprintRace';
    date: string;
    time: string;
    status: 'upcoming' | 'ongoing' | 'completed';
}

export interface SessionResultResponse {
    driver: {
        driverId: string;
        name: string;
        surname: string;
        shortName: string;
        number: number;
        nationality: string;
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

export interface ConstructorChampionshipResponse {
    api: string;
    url: string;
    limit: number;
    offset: number;
    total: number;
    season: string;
    championshipId: string;
    constructors_championship: Array<{
        classificationId: number;
        teamId: string;
        points: number;
        position: number;
        wins: number;
        team: {
            teamId: string;
            teamName: string;
            country: string;
            firstAppareance: number;
            constructorsChampionships: number | null;
            driversChampionships: number | null;
            url: string;
        };
    }>;
}

export const handleApiError = (error: unknown): ApiError => {
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