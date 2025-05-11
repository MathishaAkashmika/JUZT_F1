import axios from 'axios';
import { SessionResult, handleApiError, ApiResponse, SessionResultResponse } from './types';
import { F1_API_BASE_URL, getOpenF1Drivers } from './utils';

export const getSessionResults = async (year: string, round: string, session: string): Promise<ApiResponse<SessionResult[]>> => {
    try {
        // Handle session URL formats
        const sessionUrl = session === 'sprintQualy' ? 'sprint/qualy' :
            session === 'sprintRace' ? 'sprint/race' :
                session === 'qualifying' ? 'qualy' :
                    session;
        const response = await axios.get<{ races: { [key: string]: SessionResultResponse[] } }>(`${F1_API_BASE_URL}/${year}/${round}/${sessionUrl}`);

        // Get OpenF1 driver data for headshots
        const openF1Response = await getOpenF1Drivers();
        const openF1Drivers = openF1Response.data || [];

        let results: SessionResult[] = [];

        switch (session) {
            case 'race':
                results = response.data.races.results.map((result: SessionResultResponse) => {
                    // Find matching driver in OpenF1 data
                    const openF1Driver = openF1Drivers.find(
                        d => d.name_acronym === result.driver.shortName
                    );

                    return {
                        driver: {
                            driverId: result.driver.driverId,
                            name: result.driver.name,
                            surname: result.driver.surname,
                            shortName: result.driver.shortName,
                            number: result.driver.number,
                            nationality: result.driver.nationality,
                            imageUrl: openF1Driver?.headshot_url || undefined
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.nationality
                        },
                        time: result.time || '-',
                        position: result.position,
                        points: result.points,
                        gridPosition: result.gridPosition
                    };
                });
                break;
            case 'qualifying':
                results = response.data.races.qualyResults.map((result: SessionResultResponse) => {
                    const openF1Driver = openF1Drivers.find(
                        d => d.name_acronym === result.driver.shortName
                    );

                    return {
                        driver: {
                            driverId: result.driver.driverId,
                            name: result.driver.name,
                            surname: result.driver.surname,
                            shortName: result.driver.shortName,
                            number: result.driver.number,
                            nationality: result.driver.nationality,
                            imageUrl: openF1Driver?.headshot_url || undefined
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.nationality
                        },
                        time: result.time || '-',
                        position: result.position,
                        points: result.points,
                        gridPosition: result.gridPosition
                    };
                });
                break;
            case 'sprintQualy':
                results = response.data.races.sprintQualyResults.map((result: SessionResultResponse) => {
                    const openF1Driver = openF1Drivers.find(
                        d => d.name_acronym === result.driver.shortName
                    );

                    return {
                        driver: {
                            driverId: result.driver.driverId,
                            name: result.driver.name,
                            surname: result.driver.surname,
                            shortName: result.driver.shortName,
                            number: result.driver.number,
                            nationality: result.driver.nationality,
                            imageUrl: openF1Driver?.headshot_url || undefined
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.nationality
                        },
                        time: result.time || '-',
                        position: result.position,
                        points: result.points,
                        gridPosition: result.gridPosition
                    };
                });
                break;
            case 'sprintRace':
                results = response.data.races.sprintRaceResults.map((result: SessionResultResponse) => {
                    const openF1Driver = openF1Drivers.find(
                        d => d.name_acronym === result.driver.shortName
                    );

                    return {
                        driver: {
                            driverId: result.driver.driverId,
                            name: result.driver.name,
                            surname: result.driver.surname,
                            shortName: result.driver.shortName,
                            number: result.driver.number,
                            nationality: result.driver.nationality,
                            imageUrl: openF1Driver?.headshot_url || undefined
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.nationality
                        },
                        time: result.time || '-',
                        position: result.position,
                        points: result.points,
                        gridPosition: result.gridPosition
                    };
                });
                break;
            default: // Practice sessions (fp1, fp2, fp3)
                results = response.data.races[`${session}Results`].map((result: SessionResultResponse) => {
                    const openF1Driver = openF1Drivers.find(
                        d => d.name_acronym === result.driver.shortName
                    );

                    return {
                        driver: {
                            driverId: result.driver.driverId,
                            name: result.driver.name,
                            surname: result.driver.surname,
                            shortName: result.driver.shortName,
                            number: result.driver.number,
                            nationality: result.driver.nationality,
                            imageUrl: openF1Driver?.headshot_url || undefined
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.nationality
                        },
                        time: result.time || '-',
                        position: result.position,
                        points: result.points,
                        gridPosition: result.gridPosition
                    };
                });
        }

        return { data: results };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getRaceResults = async (year: string, round: string): Promise<ApiResponse<SessionResult[]>> => {
    try {
        const response = await axios.get<{ results: SessionResultResponse[] }>(`${F1_API_BASE_URL}/${year}/${round}/results`);

        // Transform the API response to match our SessionResult interface
        const results: SessionResult[] = response.data.results.map((result: SessionResultResponse) => ({
            driver: {
                driverId: result.driver.driverId,
                name: result.driver.name,
                surname: result.driver.surname,
                shortName: result.driver.shortName,
                number: result.driver.number,
                nationality: result.driver.nationality,
                imageUrl: undefined
            },
            team: {
                teamId: result.team.teamId,
                teamName: result.team.teamName,
                nationality: result.team.nationality
            },
            time: result.time,
            position: result.position,
            points: result.points,
            gridPosition: result.gridPosition
        }));

        return { data: results };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getQualifyingResults = async (year: string, round: string): Promise<ApiResponse<SessionResult[]>> => {
    try {
        const response = await axios.get<{ results: SessionResultResponse[] }>(`${F1_API_BASE_URL}/${year}/${round}/qualifying`);

        // Transform the API response to match our SessionResult interface
        const results: SessionResult[] = response.data.results.map((result: SessionResultResponse) => ({
            driver: {
                driverId: result.driver.driverId,
                name: result.driver.name,
                surname: result.driver.surname,
                shortName: result.driver.shortName,
                number: result.driver.number,
                nationality: result.driver.nationality,
                imageUrl: undefined
            },
            team: {
                teamId: result.team.teamId,
                teamName: result.team.teamName,
                nationality: result.team.nationality
            },
            time: result.time,
            position: result.position,
            points: result.points,
            gridPosition: result.gridPosition
        }));

        return { data: results };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getSprintResults = async (year: string, round: string): Promise<ApiResponse<SessionResult[]>> => {
    try {
        const response = await axios.get<{ results: SessionResultResponse[] }>(`${F1_API_BASE_URL}/${year}/${round}/sprint`);

        // Transform the API response to match our SessionResult interface
        const results: SessionResult[] = response.data.results.map((result: SessionResultResponse) => ({
            driver: {
                driverId: result.driver.driverId,
                name: result.driver.name,
                surname: result.driver.surname,
                shortName: result.driver.shortName,
                number: result.driver.number,
                nationality: result.driver.nationality,
                imageUrl: undefined
            },
            team: {
                teamId: result.team.teamId,
                teamName: result.team.teamName,
                nationality: result.team.nationality
            },
            time: result.time,
            position: result.position,
            points: result.points,
            gridPosition: result.gridPosition
        }));

        return { data: results };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getPracticeResults = async (year: string, round: string, session: 'fp1' | 'fp2' | 'fp3'): Promise<ApiResponse<SessionResult[]>> => {
    try {
        const response = await axios.get<{ results: SessionResultResponse[] }>(`${F1_API_BASE_URL}/${year}/${round}/${session}`);

        // Transform the API response to match our SessionResult interface
        const results: SessionResult[] = response.data.results.map((result: SessionResultResponse) => ({
            driver: {
                driverId: result.driver.driverId,
                name: result.driver.name,
                surname: result.driver.surname,
                shortName: result.driver.shortName,
                number: result.driver.number,
                nationality: result.driver.nationality,
                imageUrl: undefined
            },
            team: {
                teamId: result.team.teamId,
                teamName: result.team.teamName,
                nationality: result.team.nationality
            },
            time: result.time,
            position: result.position,
            points: result.points,
            gridPosition: result.gridPosition
        }));

        return { data: results };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};