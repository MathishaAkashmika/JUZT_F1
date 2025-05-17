// Custom types for F1 API result data

export interface ApiDriverResult {
    driverId: string;
    name: string;
    surname: string;
    shortName: string;
    number: number;
    nationality: string;
}

export interface ApiTeamResult {
    teamId: string;
    teamName: string;
    teamNationality?: string;
    nationality?: string;
}

export interface RaceResult {
    driver: ApiDriverResult;
    team: ApiTeamResult;
    position: number;
    time?: string;
    fastLap?: string;
}

export interface QualifyingResult {
    driver: ApiDriverResult;
    team: ApiTeamResult;
    gridPosition: number;
    q1?: string;
    q2?: string;
    q3?: string;
}

export interface SprintQualyResult {
    driver: ApiDriverResult;
    team: ApiTeamResult;
    gridPosition: number;
    sq1?: string | null;
    sq2?: string | null;
    sq3?: string | null;
}

export interface SprintRaceResult {
    driver: ApiDriverResult;
    team: ApiTeamResult;
    position: number;
    gridPosition: number;
    time?: string;
    fastLap?: string;
    points?: number;
}

export interface PracticeResult {
    driver: ApiDriverResult;
    team: ApiTeamResult;
    position: number;
    time?: string;
    laps?: number;
}
