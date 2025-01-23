import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MusicContextType {
  currentSong: string | null;
  setCurrentSong: (song: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentMood: string | null;
  setCurrentMood: (mood: string | null) => void;
  moodHistory: Array<{
    mood: string;
    timestamp: Date;
    songsPlayed: number;
  }>;
  addMoodToHistory: (mood: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<Array<{
    mood: string;
    timestamp: Date;
    songsPlayed: number;
  }>>([]);

  const addMoodToHistory = (mood: string) => {
    setMoodHistory(prev => [
      {
        mood,
        timestamp: new Date(),
        songsPlayed: 0
      },
      ...prev
    ]);
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        currentMood,
        setCurrentMood,
        moodHistory,
        addMoodToHistory
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export default MusicContext;
