import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MoodSelector from './components/MoodSelector';
import Player from './components/Player';
import MoodHistory from './components/MoodHistory';
import { MusicProvider } from './context/MusicContext';

const App: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<string>('');

  return (
    <MusicProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
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
                        <MoodHistory />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Now Playing</h2>
                      <Player />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Mood-Based Playlist</h2>
                      <div className="space-y-4">
                        {/* Playlist will be populated based on mood */}
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                          Select a mood to generate your personalized playlist
                        </p>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
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
