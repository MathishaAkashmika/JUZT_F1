import React, { useEffect, useState } from 'react';
import LapChart from './LapChart';
import { getRaceSessions } from '../lib/f1-api/sessions';

interface SessionDataProps {
    year: string;
    raceId: string;
}

const SessionData: React.FC<SessionDataProps> = ({ year, raceId }) => {
    const [sessionKey, setSessionKey] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await getRaceSessions(year, raceId);

                if (error) {
                    throw new Error(error.message);
                }

                // Find the race session key for lap chart
                const raceSession = data.find(session => session.type === 'race' && session.session_key);

                if (raceSession && raceSession.session_key) {
                    setSessionKey(raceSession.session_key);
                } else {
                    throw new Error('No valid race session found for this race');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load session data');
            } finally {
                setLoading(false);
            }
        };

        if (year && raceId) {
            fetchSessionData();
        }
    }, [year, raceId]);

    if (loading) {
        return <div className="session-data-loader">Loading session data...</div>;
    }

    if (error) {
        return <div className="session-data-error">Error loading session data: {error}</div>;
    }

    return (
        <div className="session-data-container">
            <h2>Race Analysis</h2>
            {sessionKey ? (
                <LapChart sessionKey={sessionKey} />
            ) : (
                <div>No lap data available for this session</div>
            )}
        </div>
    );
};

export default SessionData;
