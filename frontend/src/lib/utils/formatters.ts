export const formatLapTime = (milliseconds: number): string => {
    if (!milliseconds || milliseconds <= 0) return '--:--';

    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = Math.floor((milliseconds % 1000) / 10);

    const formattedMinutes = minutes > 0 ? `${minutes}:` : '';
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedMs = ms.toString().padStart(2, '0');

    return `${formattedMinutes}${formattedSeconds}:${formattedMs}`;
};
