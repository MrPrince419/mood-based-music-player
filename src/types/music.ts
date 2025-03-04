export interface Song {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: number;
  mood?: string;
}

export interface MoodData {
  mood: string;
  confidence: number;
  timestamp: Date;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export type RepeatMode = 'none' | 'one' | 'all';
