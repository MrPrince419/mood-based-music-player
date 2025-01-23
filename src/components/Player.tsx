import React, { useState } from 'react';

const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg animate-pulse"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No song playing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select a mood to start playing</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transform transition-transform hover:scale-105"
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
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>0:00</span>
          <span>0:00</span>
        </div>
      </div>
    </div>
  );
};

export default Player;
