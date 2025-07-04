import React from 'react';
import { Trophy } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        {/* Themed Logo Icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-orange-900 to-orange-700 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Trophy className="w-8 h-8 text-white/90" />
        </div>
        
        {/* Themed Title */}
        <div className="text-white text-xl font-semibold mb-4">Fit Rank</div>

        {/* Themed Spinner */}
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;