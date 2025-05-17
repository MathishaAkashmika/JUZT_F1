// Custom types for F1 API and OpenF1 API responses

export interface F1ApiRace {
    circuit: {
        circuitId: string;
        location: string;
    };
    schedule: {
        fp1?: SessionSchedule;
        fp2?: SessionSchedule;
        fp3?: SessionSchedule;
        qualy?: SessionSchedule;
        race?: SessionSchedule;
        sprintQualy?: SessionSchedule;
        sprintRace?: SessionSchedule;
    };
}

export interface SessionSchedule {
    date: string;
    time: string;
}

export interface OpenF1Session {
    session_key: number;
    session_name: string;
    session_type: string;
    date_start: string;
    location?: string;
    meeting_key?: number;
}
