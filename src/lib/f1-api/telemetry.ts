import axios from 'axios';
import { ApiError, handleApiError } from './types';

export interface LapData {
    driver_number: number;
    lap_number: number;
    lap_time: number;
    position: number;
    sectors: number[];
    compound?: string;
    tyre_age?: number;
}

// Interface for raw lap data from the API
interface OpenF1LapData {
    driver_number: number;
    lap_number: number;
    lap_time: number;
    position: number;
    sector_1_time?: number;
    sector_2_time?: number;
    sector_3_time?: number;
    compound?: string;
    tyre_age?: number;
}

export const getLapChartData = async (sessionKey: number): Promise<{ data: LapData[]; error?: ApiError }> => {
    try {
        if (!sessionKey) {
            return { data: [], error: { message: 'Session key is required', status: 400 } };
        } const response = await axios.get(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`);

        // Process the raw data into the format needed for our lap chart
        const lapData: LapData[] = response.data.map((lap: OpenF1LapData) => ({
            driver_number: lap.driver_number,
            lap_number: lap.lap_number,
            lap_time: lap.lap_time,
            position: lap.position,
            sectors: [lap.sector_1_time, lap.sector_2_time, lap.sector_3_time].filter(Boolean),
            compound: lap.compound,
            tyre_age: lap.tyre_age
        }));

        return { data: lapData };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};
