export interface Song {
    name: string;
    url: string;
    artist: string;
    album: string;
    duration: string;
}

export interface Mood {
    mood: string;
    confidence: number;
}

export interface MoodHistoryEntry {
    mood: string;
    confidence: number;
    timestamp: Date;
}