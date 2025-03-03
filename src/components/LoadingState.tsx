import React from 'react';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
    <div className="loading-state" role="alert" aria-busy="true">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
        <p className="mt-2 text-gray-600">{message}</p>
    </div>
);