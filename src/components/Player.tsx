import React, { useRef, useEffect, useState } from 'react';
import { Song, PlayerState } from '../types/music';
import { createError, ErrorCode, ErrorSeverity } from '../utils/errorHandling';
import { useMusic } from '../context/MusicContext';

interface PlayerProps {
  currentSong: Song | null;
  onPlayStateChange: (isPlaying: boolean) => void;
  onTimeUpdate: (currentTime: number) => void;
  onError: (error: Error) => void;
}

interface AudioState {
  currentTime: string;
  duration: string;
}

const Player: React.FC<PlayerProps> = ({
  currentSong,
  onPlayStateChange,
  onTimeUpdate,
  onError
}) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const { isPlaying, setIsPlaying } = useMusic();
  const [progress, setProgress] = useState(0);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [audioState, setAudioState] = useState<AudioState>({
    currentTime: '0:00',
    duration: '0:00'
  });
  const [duration, setDuration] = useState('0:00');
  
  // Initialize volume from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
      if (audioRef.current) {
        audioRef.current.volume = parseFloat(savedVolume);
      }
    }
  }, []);
  
  // Save volume preference
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('playerVolume', newVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  if (!browserSupported) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-lg font-bold mb-2">Browser Not Supported</h2>
        <p>Please use a modern browser that supports Web Audio API.</p>
      </div>
    );
  }
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    
    const handleError = (e: ErrorEvent) => {
      handleError(createError(
        'Audio playback error',
        ErrorCode.AUDIO_PLAYBACK,
        ErrorSeverity.ERROR,
        'Player',
        { details: e.error }
      ));
      setIsPlaying(false);
    };
  const updateProgress = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress || 0);
      setAudioState({
        currentTime: formatTime(audioRef.current.currentTime),
        duration: formatTime(audioRef.current.duration)
      });
    }
  };
  audioRef.current.addEventListener('timeupdate', updateProgress);
  audioRef.current.addEventListener('error', handleError);
  audioRef.current.addEventListener('loadedmetadata', () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
    }
  });
  return () => {
    if (audioRef.current) {
      audioRef.current.removeEventListener('timeupdate', updateProgress);
      audioRef.current.removeEventListener('error', handleError);
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };
}, [setIsPlaying]);
  // Update audio source when currentSong changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url; // Use url property from Song type
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSong]);
  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  const [volume, setVolume] = useState(1);
  // Add seek functionality
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const time = percent * audioRef.current.duration;
    try {
      audioRef.current.currentTime = time;
    } catch (error) {
      handleError(createError(
        'Failed to seek audio',
        ErrorCode.AUDIO_PLAYBACK,
        ErrorSeverity.WARNING,
        'Player'
      ));
    }
  };
  // Add volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  // Update play/pause with error handling
  const togglePlay = async () => {
    if (!audioRef.current || !currentSong) return;
  try {
    if (!audioContext.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext.current = new AudioContextClass();
    }
  if (audioContext.current.state === 'suspended') {
    await audioContext.current.resume();
  }
  const newPlayState = !isPlaying;
  setIsPlaying(newPlayState);
  onPlayStateChange(newPlayState);
} catch (error) {
  if (error instanceof Error) {
    handleError(error);
  }
}
  };
  // Update the progress bar JSX to include click handling
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg animate-pulse"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {currentSong ? currentSong.title : 'No song playing'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentSong ? 'Now playing' : 'Select a mood to start playing'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            disabled={!currentSong}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={togglePlay}
            disabled={!currentSong}
            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transform transition-transform hover:scale-105 ${
              currentSong 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
            }`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            disabled={!currentSong}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
  <div className="space-y-2">
    <div 
      className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
      onClick={handleSeek}
    >
      <div 
        className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>{audioState.currentTime}</span>
        <span>{audioState.duration}</span>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20"
        />
      </div>
    </div>
  </div>
</div>
);
};

export default Player;
