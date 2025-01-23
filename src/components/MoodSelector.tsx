import React from 'react';

interface MoodSelectorProps {
  currentMood: string;
  setCurrentMood: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMood, setCurrentMood }) => {
  const moods = [
    { name: 'Happy', color: 'yellow', icon: '😊' },
    { name: 'Sad', color: 'blue', icon: '😢' },
    { name: 'Energetic', color: 'red', icon: '⚡' },
    { name: 'Relaxed', color: 'green', icon: '😌' },
    { name: 'Romantic', color: 'pink', icon: '💖' },
    { name: 'Focused', color: 'purple', icon: '🎯' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {moods.map((mood) => (
        <button
          key={mood.name}
          onClick={() => setCurrentMood(mood.name)}
          className={`p-4 rounded-lg transition-all transform hover:scale-105 focus:outline-none ${
            currentMood === mood.name
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 hover:shadow-md'
          }`}
        >
          <div className="text-3xl mb-2">{mood.icon}</div>
          <div className={`text-sm font-medium ${
            currentMood === mood.name ? 'text-white' : 'text-gray-800 dark:text-gray-200'
          }`}>
            {mood.name}
          </div>
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;
