import axios from 'axios';
import { Driver, handleApiError, DriverChampionshipResponse, ApiResponse, DriverResponse } from './types';
import { F1_API_BASE_URL, getOpenF1Drivers } from './utils';

export const getDriverDetails = async (driverId: string): Promise<ApiResponse<Driver>> => {
    try {
        const response = await axios.get<{ drivers: DriverResponse[] }>(`${F1_API_BASE_URL}/drivers/${driverId}`);
        const driverData = response.data.drivers[0];

        // Get OpenF1 driver data for headshot
        const openF1Response = await getOpenF1Drivers();
        const openF1Drivers = openF1Response.data || [];
        const openF1Driver = openF1Drivers.find(d => d.name_acronym === driverData.shortName);

        return {
            data: {
                ...driverData,
                imageUrl: openF1Driver?.headshot_url || `/drivers/${driverData.shortName?.toLowerCase() || driverData.driverId}.png`,
            }
        };
    } catch (error) {
        return { data: {} as Driver, error: handleApiError(error) };
    }
};

export const getCurrentDrivers = async (): Promise<ApiResponse<Driver[]>> => {
    try {
        const response = await axios.get<{ drivers: DriverResponse[] }>(`${F1_API_BASE_URL}/current/drivers`);

        // Get OpenF1 driver data for headshots
        const openF1Response = await getOpenF1Drivers();
        const openF1Drivers = openF1Response.data || [];

        const drivers = await Promise.all(
            response.data.drivers.map(async (driver: DriverResponse) => {
                const details = await getDriverDetails(driver.driverId);
                const openF1Driver = openF1Drivers.find(d => d.name_acronym === details.data.shortName);

                return {
                    ...details.data,
                    team: driver.teamId,
                    teamColor: driver.teamColor || '#000000',
                    imageUrl: openF1Driver?.headshot_url || `/drivers/${details.data.shortName?.toLowerCase() || details.data.driverId}.png`,
                };
            })
        );
        return { data: drivers };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

export const getDriverStandings = async (year: string): Promise<ApiResponse<Driver[]>> => {
    try {
        const response = await axios.get<DriverChampionshipResponse>(`${F1_API_BASE_URL}/${year}/drivers-championship`);

        // Transform the API response to match our Driver interface
        const drivers: Driver[] = response.data.drivers_championship.map((standing) => ({
            driverId: standing.driverId,
            name: standing.driver.name,
            surname: standing.driver.surname,
            nationality: standing.driver.nationality,
            birthday: standing.driver.birthday,
            number: standing.driver.number,
            shortName: standing.driver.shortName,
            url: standing.driver.url,
            team: standing.teamId,
            position: standing.position,
            points: standing.points,
            wins: standing.wins || 0,
            imageUrl: undefined
        }));

        return { data: drivers };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};

/**
 * Fetches drivers data for a specific year using the f1api.dev endpoint
 * @param year - The year to fetch drivers for (e.g., "2023")
 * @returns Promise containing driver data or error
 */
export const getDriversByYear = async (year: string): Promise<ApiResponse<Driver[]>> => {
    try {
        const response = await axios.get<{ drivers: DriverResponse[] }>(`${F1_API_BASE_URL}/${year}/drivers`);

        // Transform the API response to match our Driver interface
        const drivers: Driver[] = response.data.drivers.map((driver: DriverResponse) => ({
            driverId: driver.driverId,
            name: driver.name,
            surname: driver.surname,
            nationality: driver.nationality,
            birthday: driver.birthday,
            number: driver.number,
            shortName: driver.shortName,
            url: driver.url,
            team: driver.teamId,
            imageUrl: undefined,
            position: undefined,
            points: undefined,
            wins: undefined
        }));

        return { data: drivers };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};