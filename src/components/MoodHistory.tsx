import React from 'react';

const MoodHistory: React.FC = () => {
  const moodHistory = [
    // This will be populated from context/state
  ];

  return (
    <div className="space-y-4">
      {moodHistory.length > 0 ? (
        <div className="space-y-2">
          {moodHistory.map((mood, index) => (
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
