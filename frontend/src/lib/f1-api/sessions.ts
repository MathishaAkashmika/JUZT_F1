import axios from 'axios';
import { Session, ApiError, handleApiError } from './types';
import { F1_API_BASE_URL } from './utils';

export const getRaceSessions = async (year: string, raceId: string): Promise<{ data: Session[]; error?: ApiError }> => {
    try {
        console.log(`Fetching race data for year: ${year}, raceId: ${raceId}`);
        const response = await axios.get(`${F1_API_BASE_URL}/${year}`);
        const race = response.data.races.find((r: any) => r.circuit.circuitId === raceId);

        if (!race) {
            console.log(`Race not found for raceId: ${raceId}`);
            return { data: [], error: { message: 'Race not found', status: 404 } };
        }

        // Extract the circuit location from the race data
        const circuitLocation = race.circuit.location;
        console.log(`Circuit location: ${circuitLocation}`);
        console.log('Race schedule:', JSON.stringify(race.schedule, null, 2));

        // Fetch all session keys for the year from OpenF1 API
        console.log(`Fetching OpenF1 sessions for year: ${year}`);
        let openF1Sessions = [];
        try {
            const openF1Response = await axios.get(`https://api.openf1.org/v1/sessions?year=${year}`);
            if (Array.isArray(openF1Response.data)) {
                openF1Sessions = openF1Response.data;
                console.log(`Received ${openF1Sessions.length} sessions from OpenF1 API`);
            } else {
                console.error('OpenF1 API returned invalid data format:', openF1Response.data);
                return { data: [], error: { message: 'Invalid OpenF1 API response format', status: 500 } };
            }
        } catch (openF1Error) {
            console.error('Error fetching OpenF1 sessions:', openF1Error);
            return { data: [], error: { message: 'Failed to fetch OpenF1 sessions', status: 500 } };
        }

        // Filter by location if possible
        if (circuitLocation) {
            const locationMatches = openF1Sessions.filter((session: any) => {
                if (!session || !session.location) return false;
                const sessionLocation = session.location.toLowerCase();
                const targetLocation = circuitLocation.toLowerCase();
                console.log(`Comparing locations: "${sessionLocation}" vs "${targetLocation}"`);
                return sessionLocation.includes(targetLocation) || targetLocation.includes(sessionLocation);
            });

            if (locationMatches.length > 0) {
                console.log(`Found ${locationMatches.length} sessions for ${circuitLocation}`);
                console.log('Location matched sessions:', JSON.stringify(locationMatches, null, 2));
                openF1Sessions = locationMatches;
            } else {
                console.log(`No location matches found for ${circuitLocation}`);
            }
        }

        const sessions: Session[] = [];

        // Add regular sessions with improved error handling
        const addSession = (schedule: any, type: string, sessionType: string) => {
            if (schedule?.date) {
                try {
                    const session_key = findSessionKeyByDate(openF1Sessions, schedule.date, schedule.time, sessionType);
                    sessions.push({
                        id: type,
                        type: type,
                        date: schedule.date,
                        time: schedule.time,
                        status: 'upcoming',
                        session_key
                    });
                } catch (error) {
                    console.error(`Error processing ${type} session:`, error);
                }
            }
        };

        // Add all session types
        addSession(race.schedule.fp1, 'fp1', 'Practice 1');
        addSession(race.schedule.fp2, 'fp2', 'Practice 2');
        addSession(race.schedule.fp3, 'fp3', 'Practice 3');
        addSession(race.schedule.qualy, 'qualifying', 'Qualifying');
        addSession(race.schedule.race, 'race', 'Race');
        addSession(race.schedule.sprintQualy, 'sprintQualy', 'Sprint Qualifying');
        addSession(race.schedule.sprintRace, 'sprintRace', 'Sprint');

        return { data: sessions };
    } catch (error) {
        console.error('Error in getRaceSessions:', error);
        return { data: [], error: handleApiError(error) };
    }
};

/**
 * Find the session key by matching the date and approximate time.
 * This helper function compares the date_start from OpenF1 API with our race schedule date and time.
 */
const findSessionKeyByDate = (openF1Sessions: any[], date: string, time: string, sessionType: string): number | null => {
    if (!date || !time || !sessionType) {
        console.log('Missing required parameters:', { date, time, sessionType });
        return null;
    }

    // Convert API time format (e.g., "04:00:00Z") to match OpenF1 time format
    const normalizedTime = time.replace('Z', '+00:00');
    const targetDateTime = `${date}T${normalizedTime}`;

    console.log(`Looking for session: ${sessionType} on ${date} at ${time}`);
    console.log(`Target datetime: ${targetDateTime}`);

    // Special handling for practice sessions
    if (sessionType.toLowerCase().includes('practice') ||
        sessionType.toLowerCase().includes('fp1') ||
        sessionType.toLowerCase().includes('fp2') ||
        sessionType.toLowerCase().includes('fp3')) {

        console.log('Processing practice session');

        // First try to find by exact date and session name
        const exactMatch = openF1Sessions.find((session) => {
            if (!session || !session.date_start) return false;
            const sessionDate = session.date_start.substring(0, 10);
            const isDateMatch = sessionDate === date;
            const isTypeMatch = session.session_type === 'Practice' &&
                session.session_name === `Practice ${sessionType.replace(/[^0-9]/g, '')}`;

            console.log(`Checking practice session: ${session.session_name}`);
            console.log(`Date match: ${isDateMatch}, Type match: ${isTypeMatch}`);
            console.log(`Session details:`, JSON.stringify(session, null, 2));

            return isDateMatch && isTypeMatch;
        });

        if (exactMatch?.session_key) {
            console.log(`Found exact match for ${sessionType} with key: ${exactMatch.session_key}`);
            return exactMatch.session_key;
        }

        // If no exact match, try to find by session type and closest date
        const typeMatches = openF1Sessions.filter((session) => {
            if (!session) return false;
            return session.session_type === 'Practice' &&
                session.session_name === `Practice ${sessionType.replace(/[^0-9]/g, '')}`;
        });

        if (typeMatches.length > 0) {
            console.log(`Found ${typeMatches.length} potential practice session matches`);
            // Sort by date difference and take the closest one
            const targetDate = new Date(date).getTime();
            typeMatches.sort((a, b) => {
                const dateA = new Date(a.date_start).getTime();
                const dateB = new Date(b.date_start).getTime();
                return Math.abs(dateA - targetDate) - Math.abs(dateB - targetDate);
            });

            const closestMatch = typeMatches[0];
            console.log(`Using closest practice session match: ${closestMatch.session_name} with key: ${closestMatch.session_key}`);
            return closestMatch.session_key;
        }
    }

    // Special handling for qualifying and race sessions
    if (sessionType.toLowerCase().includes('qualifying') || sessionType.toLowerCase() === 'race') {
        console.log('Processing qualifying or race session');

        // First try to find by exact date and session type
        const exactMatch = openF1Sessions.find((session) => {
            if (!session || !session.date_start) return false;
            const sessionDate = session.date_start.substring(0, 10);
            const isDateMatch = sessionDate === date;
            const isTypeMatch = matchSessionType(session.session_type || session.session_name, sessionType);

            console.log(`Checking session: ${session.session_name}`);
            console.log(`Date match: ${isDateMatch}, Type match: ${isTypeMatch}`);

            return isDateMatch && isTypeMatch;
        });

        if (exactMatch?.session_key) {
            console.log(`Found exact match for ${sessionType} with key: ${exactMatch.session_key}`);
            return exactMatch.session_key;
        }

        // If no exact match, try to find by session type and closest date
        const typeMatches = openF1Sessions.filter((session) => {
            if (!session) return false;
            return matchSessionType(session.session_type || session.session_name, sessionType);
        });

        if (typeMatches.length > 0) {
            console.log(`Found ${typeMatches.length} potential matches for ${sessionType}`);
            // Sort by date difference and take the closest one
            const targetDate = new Date(date).getTime();
            typeMatches.sort((a, b) => {
                const dateA = new Date(a.date_start).getTime();
                const dateB = new Date(b.date_start).getTime();
                return Math.abs(dateA - targetDate) - Math.abs(dateB - targetDate);
            });

            const closestMatch = typeMatches[0];
            console.log(`Using closest match: ${closestMatch.session_name} with key: ${closestMatch.session_key}`);
            return closestMatch.session_key;
        }
    }

    // For other session types, use the original matching logic
    console.log(`Available OpenF1 sessions:`, openF1Sessions.map(s =>
        `${s.session_name} (${s.date_start}) - Key: ${s.session_key} - Type: ${s.session_type}`));

    // Try exact date match first
    const exactDateMatch = openF1Sessions.find((session) => {
        if (!session || !session.date_start) return false;
        const sessionDate = session.date_start.substring(0, 10);
        if (sessionDate === date) {
            const isTypeMatch = matchSessionType(session.session_type || session.session_name, sessionType);
            console.log(`Date match found for ${date}: ${session.session_name}, type match: ${isTypeMatch}`);
            return isTypeMatch;
        }
        return false;
    });

    if (exactDateMatch?.session_key) {
        console.log(`Exact match found with key: ${exactDateMatch.session_key}`);
        return exactDateMatch.session_key;
    }

    // Try matching by session type only
    const typeMatch = openF1Sessions.find((session) => {
        if (!session) return false;
        const isTypeMatch = matchSessionType(session.session_type || session.session_name, sessionType);
        console.log(`Checking session: ${session.session_name}, type match: ${isTypeMatch}`);
        return isTypeMatch;
    });

    if (typeMatch?.session_key) {
        console.log(`Type match found with key: ${typeMatch.session_key}`);
        return typeMatch.session_key;
    }

    console.log(`No session key found for ${sessionType} on ${date}`);
    return null;
};

/**
 * Helper function to match session types between our naming convention and OpenF1 API
 */
const matchSessionType = (apiSessionType: string, ourSessionType: string): boolean => {
    if (!apiSessionType || !ourSessionType) return false;

    const apiType = apiSessionType.toLowerCase();
    const ourType = ourSessionType.toLowerCase();

    console.log(`Comparing session types: API="${apiType}" vs Our="${ourType}"`);

    // Enhanced matching for practice sessions
    if (ourType.includes('practice 1') || ourType.includes('fp1')) {
        return apiType === 'practice' && apiType.includes('practice 1');
    }

    if (ourType.includes('practice 2') || ourType.includes('fp2')) {
        return apiType === 'practice' && apiType.includes('practice 2');
    }

    if (ourType.includes('practice 3') || ourType.includes('fp3')) {
        return apiType === 'practice' && apiType.includes('practice 3');
    }

    // Enhanced matching for qualifying
    if (ourType.includes('qualifying')) {
        return apiType.includes('qualify') ||
            apiType.includes('q1') ||
            apiType.includes('q2') ||
            apiType.includes('q3') ||
            apiType.includes('qualification');
    }

    // Enhanced matching for race
    if (ourType === 'race') {
        return apiType === 'race' ||
            apiType.includes('grand prix') ||
            apiType.includes('gp');
    }

    // Match sprint sessions
    if ((ourType.includes('sprint') && apiType.includes('sprint')) ||
        (ourType.includes('sprintqualy') && apiType.includes('sprint qualifying'))) {
        return true;
    }

    return false;
};