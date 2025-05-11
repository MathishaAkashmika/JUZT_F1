import axios from 'axios';

const F1_API_BASE_URL = 'https://f1api.dev/api';
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
}

export interface Constructor {
    id: number;
    name: string;
    color: string;
    logoUrl: string;
    points?: number;
    position?: number;
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
    };
    team: {
        teamId: string;
        teamName: string;
        nationality: string;
    };
    time: string;
    position: number;
}

const handleApiError = (error: any): ApiError => {
    if (axios.isAxiosError(error)) {
        return {
            message: error.response?.data?.message || 'An error occurred while fetching data',
            status: error.response?.status || 500
        };
    }
    return {
        message: 'An unexpected error occurred',
        status: 500
    };
};

export const getDriverDetails = async (driverId: string): Promise<{ data: Driver; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/drivers/${driverId}`);
        const driverData = response.data.drivers[0];
        return {
            data: {
                ...driverData,
                imageUrl: `/drivers/${driverData.shortName?.toLowerCase() || driverData.driverId}.png`,
            }
        };
    } catch (error) {
        return { data: {} as Driver, error: handleApiError(error) };
    }
};

export const getCurrentDrivers = async (): Promise<{ data: Driver[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/current/drivers`);
        const drivers = await Promise.all(
            response.data.drivers.map(async (driver: any) => {
                const details = await getDriverDetails(driver.driverId);
                return {
                    ...details.data,
                    team: driver.teamId,
                    teamColor: driver.teamColor || '#000000',
                    position: driver.position,
                    points: driver.points,
                };
            })
        );
        return { data: drivers };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getDriverStandings = async (year: string): Promise<{ data: Driver[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/drivers`);
        const drivers = await Promise.all(
            response.data.drivers.map(async (driver: any) => {
                const details = await getDriverDetails(driver.driverId);
                return {
                    ...details.data,
                    team: driver.teamId,
                    teamColor: driver.teamColor || '#000000',
                    position: driver.position,
                    points: driver.points,
                };
            })
        );
        return { data: drivers };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

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

export const getRaces = async (year: string): Promise<{ data: Race[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/races`);
        const races = response.data.data.map((race: any) => ({
            id: race.id,
            name: race.name,
            circuit: race.circuit,
            date: race.date,
            country: race.country,
            round: race.round,
        }));
        return { data: races };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getTracks = async (year: string): Promise<{ data: Track[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}`);
        const tracks = response.data.races.map((race: any) => ({
            id: race.circuit.circuitId,
            name: race.circuit.circuitName,
            circuit: race.circuit.circuitName,
            country: race.circuit.country,
            city: race.circuit.city,
            length: parseFloat(race.circuit.circuitLength.replace('km', '')),
            laps: race.laps,
            firstGrandPrix: race.circuit.firstParticipationYear,
            round: race.round,
            lapRecord: {
                time: race.circuit.lapRecord || '-',
                driver: race.circuit.fastestLapDriverId || '-',
                year: race.circuit.fastestLapYear || 0
            }
        }));
        return { data: tracks };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getRaceSessions = async (year: string, raceId: string): Promise<{ data: Session[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}`);
        const race = response.data.races.find((r: any) => r.circuit.circuitId === raceId);

        if (!race) {
            return { data: [], error: { message: 'Race not found', status: 404 } };
        }

        const sessions: Session[] = [];

        // Add regular sessions
        if (race.schedule.fp1?.date) {
            sessions.push({
                id: 'fp1',
                type: 'fp1',
                date: race.schedule.fp1.date,
                time: race.schedule.fp1.time,
                status: 'upcoming'
            });
        }
        if (race.schedule.fp2?.date) {
            sessions.push({
                id: 'fp2',
                type: 'fp2',
                date: race.schedule.fp2.date,
                time: race.schedule.fp2.time,
                status: 'upcoming'
            });
        }
        if (race.schedule.fp3?.date) {
            sessions.push({
                id: 'fp3',
                type: 'fp3',
                date: race.schedule.fp3.date,
                time: race.schedule.fp3.time,
                status: 'upcoming'
            });
        }
        if (race.schedule.qualy?.date) {
            sessions.push({
                id: 'qualifying',
                type: 'qualifying',
                date: race.schedule.qualy.date,
                time: race.schedule.qualy.time,
                status: 'upcoming'
            });
        }
        if (race.schedule.race?.date) {
            sessions.push({
                id: 'race',
                type: 'race',
                date: race.schedule.race.date,
                time: race.schedule.race.time,
                status: 'upcoming'
            });
        }
        // Add sprint sessions if they exist
        if (race.schedule.sprintQualy?.date) {
            sessions.push({
                id: 'sprintQualy',
                type: 'sprintQualy',
                date: race.schedule.sprintQualy.date,
                time: race.schedule.sprintQualy.time,
                status: 'upcoming'
            });
        }
        if (race.schedule.sprintRace?.date) {
            sessions.push({
                id: 'sprintRace',
                type: 'sprintRace',
                date: race.schedule.sprintRace.date,
                time: race.schedule.sprintRace.time,
                status: 'upcoming'
            });
        }

        return { data: sessions };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

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

export const getSessionResults = async (year: string, round: string, session: string): Promise<{ data: SessionResult[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/${round}/${session}`);
        const results = response.data.races[`${session}Results`].map((result: any) => ({
            driver: {
                driverId: result.driver.driverId,
                name: result.driver.name,
                surname: result.driver.surname,
                shortName: result.driver.shortName,
                number: result.driver.number,
                nationality: result.driver.nationality
            },
            team: {
                teamId: result.team.teamId,
                teamName: result.team.teamName,
                nationality: result.team.nationality
            },
            time: result.time,
            position: result[`${session}Id`]
        }));
        return { data: results };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
}; 