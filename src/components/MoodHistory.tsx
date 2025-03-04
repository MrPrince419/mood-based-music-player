import React from 'react';
import { MoodData } from '../types/music';

interface MoodHistoryProps {
  history: MoodData[];
  onMoodSelect?: (mood: string) => void;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ history, onMoodSelect }) => {
  return (
    <div className="space-y-4">
      {history.length > 0 ? (
        <div className="space-y-2">
          {history.map((mood, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">😊</div>
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">Happy</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                12 songs played
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No mood history yet</p>
          <p className="text-sm">Your mood history will appear here</p>
        </div>
      )}
    </div>
  );
};

export default MoodHistory;
