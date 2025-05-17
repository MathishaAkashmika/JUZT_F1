import axios from 'axios';
import { SessionResult, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL, getOpenF1Drivers } from './utils';
import {
    RaceResult,
    QualifyingResult,
    SprintQualyResult,
    SprintRaceResult,
    PracticeResult
} from './result-types';

export const getSessionResults = async (year: string, round: string, session: string): Promise<{ data: SessionResult[]; error?: ApiError }> => {
    try {
        // Handle session URL formats
        const sessionUrl = session === 'sprintQualy' ? 'sprint/qualy' :
            session === 'sprintRace' ? 'sprint/race' :
                session === 'qualifying' ? 'qualy' :
                    session;
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/${round}/${sessionUrl}`);

        // Get OpenF1 driver data for headshots
        const openF1Response = await getOpenF1Drivers();
        const openF1Drivers = openF1Response.data || [];

        let results: SessionResult[] = []; switch (session) {
            case 'race':
                results = response.data.races.results.map((result: RaceResult) => {
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
                            imageUrl: openF1Driver?.headshot_url || null
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.teamNationality || result.team.nationality
                        },
                        time: result.time || result.fastLap || '-',
                        position: result.position
                    };
                }); break;
            case 'qualifying':
                results = response.data.races.qualyResults.map((result: QualifyingResult) => {
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
                            imageUrl: openF1Driver?.headshot_url || null
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.teamNationality || result.team.nationality
                        },
                        time: result.q3 || result.q2 || result.q1 || '-',
                        position: result.gridPosition
                    };
                }); break;
            case 'sprintQualy': results = response.data.races.sprintQualyResults.map((result: SprintQualyResult) => {
                // Clean up qualifying times by removing tab characters
                const cleanTime = (time: string | null | undefined) => time ? time.replace(/\t/g, '').trim() : null;
                const sq3 = cleanTime(result.sq3);
                const sq2 = cleanTime(result.sq2);
                const sq1 = cleanTime(result.sq1);

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
                        imageUrl: openF1Driver?.headshot_url || null
                    },
                    team: {
                        teamId: result.team.teamId,
                        teamName: result.team.teamName,
                        nationality: result.team.teamNationality || result.team.nationality
                    },
                    time: sq3 || sq2 || sq1 || '-',
                    position: result.gridPosition
                };
            }); break;
            case 'sprintRace':
                results = response.data.races.sprintRaceResults.map((result: SprintRaceResult) => {
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
                            imageUrl: openF1Driver?.headshot_url || null
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.teamNationality || result.team.nationality
                        },
                        time: result.time || result.fastLap || '-',
                        position: result.position,
                        points: result.points || 0,
                        gridPosition: result.gridPosition
                    };
                }); break;
            default: // Practice sessions (fp1, fp2, fp3)
                results = response.data.races[`${session}Results`].map((result: PracticeResult) => {
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
                            imageUrl: openF1Driver?.headshot_url || null
                        },
                        team: {
                            teamId: result.team.teamId,
                            teamName: result.team.teamName,
                            nationality: result.team.teamNationality || result.team.nationality
                        },
                        time: result.time || '-',
                        position: result.position
                    };
                });
        }

        return { data: results };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};