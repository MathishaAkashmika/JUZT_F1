import axios from 'axios';
import { ApiError, OpenF1Driver, handleApiError } from './types';

export const F1_API_BASE_URL = process.env.NEXT_PUBLIC_F1_API_BASE_URL;
export const OPENF1_API_BASE_URL = process.env.NEXT_PUBLIC_OPENF1_API_BASE_URL;

export const getOpenF1Drivers = async (): Promise<{ data: OpenF1Driver[]; error?: ApiError }> => {
    try {
        const response = await axios.get(`${OPENF1_API_BASE_URL}/drivers`);
        return { data: response.data };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};