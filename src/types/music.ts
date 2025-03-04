export interface Song {
  id: string;
  title: string;
  url: string;
  mood: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export interface MoodData {
  timestamp: number;
  mood: string;
}

export interface MoodHistoryProps {
  history: MoodData[];
}

export type RepeatMode = 'none' | 'one' | 'all';
