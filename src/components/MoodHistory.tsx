import React from 'react';
import { MoodHistoryProps } from '../types/music';

const MoodHistory: React.FC<MoodHistoryProps> = ({ history }) => {
  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={index} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <p>{entry.mood}</p>
          <small>{new Date(entry.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default MoodHistory;
