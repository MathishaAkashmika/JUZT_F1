import axios from 'axios';
import { Track, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL } from './utils';

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