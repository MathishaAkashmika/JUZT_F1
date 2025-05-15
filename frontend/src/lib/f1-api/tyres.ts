import axios from 'axios';
import { ApiError, handleApiError } from './types';

export interface Stint {
    meeting_key: number;
    session_key: number;
    stint_number: number;
    driver_number: number;
    lap_start: number;
    lap_end: number;
    compound: string;
    tyre_age_at_start: number;
}

export interface TyreDriver {
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

export const getDriversForTyreStrategy = async (sessionKey: number): Promise<{ data: TyreDriver[]; error?: ApiError }> => {
    try {
        if (!sessionKey) {
            return { data: [], error: { message: 'Session key is required', status: 400 } };
        }
        const response = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
        return { data: response.data };
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return { data: [], error: handleApiError(error) };
    }
};

export const getDriverStints = async (sessionKey: number, driverNumber: number): Promise<{ data: Stint[]; error?: ApiError }> => {
    try {
        if (!sessionKey) {
            return { data: [], error: { message: 'Session key is required', status: 400 } };
        }
        const response = await axios.get(`https://api.openf1.org/v1/stints?session_key=${sessionKey}&driver_number=${driverNumber}`);
        return { data: response.data };
    } catch (error) {
        console.error(`Error fetching stints for driver ${driverNumber}:`, error);
        return { data: [], error: handleApiError(error) };
    }
};

export const getAllDriverStints = async (sessionKey: number, drivers: TyreDriver[]): Promise<{ [key: number]: Stint[] }> => {
    const stintsByDriver: { [key: number]: Stint[] } = {};

    // Use Promise.all to fetch all driver stints in parallel
    await Promise.all(drivers.map(async (driver) => {
        const result = await getDriverStints(sessionKey, driver.driver_number);
        if (result.data.length > 0) {
            stintsByDriver[driver.driver_number] = result.data;
        }
    }));

    return stintsByDriver;
};

// Function to get a color for each compound
export const getTyreColor = (compound: string): string => {
    const colors: { [key: string]: string } = {
        'SOFT': '#FF0000',      // Red
        'MEDIUM': '#FFFF00',    // Yellow
        'HARD': '#FFFFFF',      // White
        'INTERMEDIATE': '#00FF00', // Green
        'WET': '#0000FF',       // Blue
        'UNKNOWN': '#808080'    // Gray
    };

    return colors[compound] || colors['UNKNOWN'];
};
