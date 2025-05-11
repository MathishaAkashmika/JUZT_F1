import axios from 'axios';
import { Session, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL } from './utils';

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