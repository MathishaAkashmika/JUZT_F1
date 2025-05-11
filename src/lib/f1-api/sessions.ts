import axios from 'axios';
import { Session, handleApiError, ApiResponse, SessionResponse } from './types';
import { F1_API_BASE_URL } from './utils';

export const getRaceSessions = async (year: string, round: string): Promise<ApiResponse<Session[]>> => {
    try {
        const response = await axios.get<{ sessions: SessionResponse[] }>(`${F1_API_BASE_URL}/${year}/${round}/sessions`);

        // Transform the API response to match our Session interface
        const sessions: Session[] = response.data.sessions.map((session: SessionResponse) => ({
            id: session.id,
            type: session.type,
            date: session.date,
            time: session.time,
            status: session.status
        }));

        return { data: sessions };
    } catch (error) {
        return { data: [], error: handleApiError(error) };
    }
};