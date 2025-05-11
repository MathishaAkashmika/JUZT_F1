import axios from 'axios';
import { Driver, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL, getOpenF1Drivers } from './utils';

export const getDriverDetails = async (driverId: string): Promise<{ data: Driver; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/drivers/${driverId}`);
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

export const getCurrentDrivers = async (): Promise<{ data: Driver[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${F1_API_BASE_URL}/current/drivers`);

        // Get OpenF1 driver data for headshots
        const openF1Response = await getOpenF1Drivers();
        const openF1Drivers = openF1Response.data || [];

        const drivers = await Promise.all(
            response.data.drivers.map(async (driver: any) => {
                const details = await getDriverDetails(driver.driverId);
                const openF1Driver = openF1Drivers.find(d => d.name_acronym === details.data.shortName);

                return {
                    ...details.data,
                    team: driver.teamId,
                    teamColor: driver.teamColor || '#000000',
                    position: driver.position,
                    points: driver.points,
                    imageUrl: openF1Driver?.headshot_url || `/drivers/${details.data.shortName?.toLowerCase() || details.data.driverId}.png`,
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
        const response = await axios.get(`${F1_API_BASE_URL}/${year}/drivers-championship`);

        // Get OpenF1 driver data for headshots
        const openF1Response = await getOpenF1Drivers();
        const openF1Drivers = openF1Response.data || [];

        const drivers = response.data.drivers_championship.map((item: any) => {
            // Try to find matching driver in OpenF1 data
            const openF1Driver = openF1Drivers.find(
                d => d.name_acronym === item.driver.shortName
            );

            return {
                driverId: item.driverId,
                name: item.driver.name,
                surname: item.driver.surname,
                nationality: item.driver.nationality,
                birthday: item.driver.birthday,
                number: item.driver.number,
                shortName: item.driver.shortName,
                url: item.driver.url,
                team: item.teamId,
                teamColor: '#000000', // Default color, could be enhanced
                position: item.position,
                points: item.points,
                wins: item.wins || 0,
                imageUrl: openF1Driver?.headshot_url || `/drivers/${item.driver.shortName?.toLowerCase() || item.driverId}.png`,
            };
        });
        return { data: drivers };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};