import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MoodSelector from './components/MoodSelector';
import Player from './components/Player';
import MoodHistory from './components/MoodHistory';
import { MusicProvider } from './context/MusicContext';

const App: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check if the browser supports the Web Audio API
      if (!window.AudioContext && !window.webkitAudioContext) {
        setError('Your browser does not support the Web Audio API');
        return;
      }

      // Request audio permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissionStatus('granted');
          setError(null);
        } catch (err) {
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setPermissionStatus('denied');
              setError('Permission denied. Please allow access to audio in your browser settings.');
            } else {
              setPermissionStatus('denied');
              setError('An error occurred while requesting audio permission.');
            }
          }
        }
      } else {
        setError('Audio input is not supported in this browser.');
      }
    } catch (err) {
      setError('An unexpected error occurred while checking audio permissions.');
    }
  };

  const handleRequestPermission = async () => {
    await checkPermissions();
  };

  const handlePlayStateChange = (isPlaying: boolean) => {
    // Handle play state change
  };

  const handleTimeUpdate = (currentTime: number) => {
    // Handle time update
  };

  const handlePlayerError = (error: Error) => {
    // Handle player error
  };

  return (
    <MusicProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              {error ? (
                <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                      {permissionStatus === 'denied' && (
                        <button
                          onClick={handleRequestPermission}
                          className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                        >
                          Request Permission Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={
                    <div className="space-y-8">
                      <header className="text-center">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text animate-pulse-slow">
                          Mood Music Player
                        </h1>
                        <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                          Let your emotions guide your music
                        </p>
                      </header>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Current Mood</h2>
                          <MoodSelector currentMood={currentMood} setCurrentMood={setCurrentMood} />
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Mood History</h2>
                          <MoodHistory history={moodHistory} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Now Playing</h2>
                        <Player 
                          currentSong={currentPlayingSong}
                          onPlayStateChange={handlePlayStateChange}
                          onTimeUpdate={handleTimeUpdate}
                          onError={handlePlayerError}
                        />
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Mood-Based Playlist</h2>
                        <div className="space-y-4">
                          <p className="text-gray-600 dark:text-gray-400 text-center">
                            Select a mood to generate your personalized playlist
                          </p>
                        </div>
                      </div>
                    </div>
                  } />
                </Routes>
              )}
            </div>
          </main>

          {/* Theme Toggle Button */}
          <div className="fixed bottom-8 right-8">
            <button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-lg transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>
      </Router>
    </MusicProvider>
  );
};

export default App;
