import axios from 'axios';
import { ApiError, handleApiError } from './types';

export interface Driver {
    driver_number: number;
    full_name: string;
    name_acronym: string;
    team_name: string;
    team_color: string;
    session_key: number;
}

export interface LapData {
    meeting_key: number;
    session_key: number;
    driver_number: number;
    lap_number: number;
    date_start: string;
    duration_sector_1: number | null;
    duration_sector_2: number | null;
    duration_sector_3: number | null;
    i1_speed: number;
    i2_speed: number;
    is_pit_out_lap: boolean;
    lap_duration: number | null;
    segments_sector_1: number[];
    segments_sector_2: number[];
    segments_sector_3: number[];
    st_speed: number;
}

export interface ProcessedLapData {
    driverNumber: number;
    driverName: string;
    acronym: string;
    team: string;
    teamColor: string;
    laps: {
        number: number;
        time: number;
        position: number;
        sector1?: number;
        sector2?: number;
        sector3?: number;
    }[];
}

export const getDriversForSession = async (sessionKey: number): Promise<{ data: Driver[]; error?: ApiError }> => {
    try {
        console.log(`Fetching drivers for session key: ${sessionKey}`);
        const response = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
        console.log('Drivers API response:', response.data);
        return { data: response.data };
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return { data: [], error: handleApiError(error) };
    }
};

export const getLapsForSession = async (sessionKey: number): Promise<{ data: LapData[]; error?: ApiError }> => {
    try {
        console.log(`Fetching laps for session key: ${sessionKey}`);
        const response = await axios.get(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`);
        console.log('Laps API response:', response.data);
        return { data: response.data };
    } catch (error) {
        console.error('Error fetching laps:', error);
        return { data: [], error: handleApiError(error) };
    }
};

export const processLapChartData = (laps: LapData[], drivers: Driver[]): ProcessedLapData[] => {
    console.log('Processing lap data:', { laps, drivers });
    const driverMap = new Map<number, Driver>();

    // Create a map of driver numbers to driver info
    drivers.forEach(driver => {
        driverMap.set(driver.driver_number, driver);
    });

    // Group laps by driver
    const lapsByDriver = laps.reduce((acc: { [key: number]: LapData[] }, lap) => {
        if (!acc[lap.driver_number]) {
            acc[lap.driver_number] = [];
        }
        // Only include valid lap times
        if (lap.lap_duration && lap.lap_duration > 0) {
            acc[lap.driver_number].push(lap);
        }
        return acc;
    }, {});

    console.log('Laps grouped by driver:', lapsByDriver);

    // Process data for each driver
    const processedData = Object.entries(lapsByDriver).map(([driverNumber, driverLaps]) => {
        const driver = driverMap.get(parseInt(driverNumber)) || {
            driver_number: parseInt(driverNumber),
            full_name: `Driver ${driverNumber}`,
            name_acronym: `D${driverNumber}`,
            team_name: 'Unknown',
            team_color: '#cccccc',
            session_key: 0
        };

        // Sort laps by lap number
        driverLaps.sort((a, b) => a.lap_number - b.lap_number);

        return {
            driverNumber: parseInt(driverNumber),
            driverName: driver.full_name,
            acronym: driver.name_acronym,
            team: driver.team_name,
            teamColor: driver.team_color || '#cccccc',
            laps: driverLaps.map(lap => ({
                number: lap.lap_number,
                time: lap.lap_duration || 0,
                position: 0, // Position data is not available in the API response
                sector1: lap.duration_sector_1 || undefined,
                sector2: lap.duration_sector_2 || undefined,
                sector3: lap.duration_sector_3 || undefined
            }))
        };
    }).filter(driver => driver.laps.length > 0);

    console.log('Processed lap data:', processedData);
    return processedData;
};
