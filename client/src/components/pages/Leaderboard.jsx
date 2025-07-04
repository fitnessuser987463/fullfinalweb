// src/pages/Leaderboard.jsx

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, Zap } from 'lucide-react';
import { useSocket } from '../../context/SocketContext'; 
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Header from '../../components/common/Header';

// ... (Helper components Avatar and StreakDisplay are unchanged)
const Avatar = ({ src, name, size = 'w-12 h-12' }) => {
  if (src) {
    return <img src={src} alt={name} className={`${size} rounded-full object-cover`} />;
  }
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className={`${size} rounded-full bg-gray-700 flex items-center justify-center`}>
      <span className="text-white font-bold text-xl">{initial}</span>
    </div>
  );
};
const StreakDisplay = ({ streak }) => {
  const getStreakMessage = () => {
    if (streak === 0) return "Complete a challenge to start your streak!";
    if (streak <= 3) return "Keep the fire going!";
    if (streak <= 7) return "You're on a roll!";
    return "You're unstoppable!";
  };
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center mb-8 max-w-lg mx-auto">
      <div className="flex justify-center items-center mb-4">
        <Flame className={`w-16 h-16 ${streak > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
        <div className="ml-4 text-left">
          <h2 className="text-xl font-bold text-white">Your Current Streak</h2>
          <p className="text-5xl font-extrabold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{streak}</p>
        </div>
      </div>
      <p className="text-gray-400">{getStreakMessage()}</p>
    </div>
  );
};


const Leaderboard = () => {
  // MODIFIED: Get isAuthenticated and loading status from auth context
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { socket } = useSocket(); 
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserStreak, setCurrentUserStreak] = useState(user?.currentStreak || 0);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true); // Set loading to true for fetch operation
      const response = await api.get('/leaderboard/global');
      setLeaderboardData(response.data);

      if (user?._id) {
        const userEntry = response.data.find(entry => entry.userId === user._id.toString());
        setCurrentUserStreak(userEntry ? userEntry.streak : 0);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // --- FIX: This check prevents the API call from running until authentication is confirmed ---
    if (isAuthenticated && !authLoading) {
      fetchLeaderboardData();

      if (socket) {
        const handleLeaderboardUpdate = () => {
          console.log('Received leaderboard_updated event. Refetching...');
          fetchLeaderboardData();
        };
        
        socket.on('leaderboard_updated', handleLeaderboardUpdate);

        return () => {
          socket.off('leaderboard_updated', handleLeaderboardUpdate);
        };
      }
    }
  }, [isAuthenticated, authLoading, socket]); // Depend on authentication status

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5" />;
    if (rank === 2) return <Medal className="w-5 h-5" />;
    if (rank === 3) return <Medal className="w-5 h-5" />;
    return `#${rank}`;
  };
  
  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-yellow-500/10 text-yellow-400';
    if (rank === 2) return 'bg-gray-200/10 text-gray-300';
    if (rank === 3) return 'bg-orange-600/10 text-orange-500';
    return 'bg-gray-700/50 text-gray-400';
  };

  const isCurrentUser = (entry) => {
    if (!user || !user._id) return false;
    return entry.userId === user._id.toString();
  };
  
  // MODIFIED: The main loading state now considers auth loading as well
  if (loading || authLoading) {
     return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            <span>Streak Leaderboard</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300">Consistency is key. Miss a day, and your streak resets to zero.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <StreakDisplay streak={currentUserStreak} />
            
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="overflow-hidden">
                {leaderboardData.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {leaderboardData.map((entry) => (
                      <div
                        key={entry.userId}
                        className={`flex p-4 gap-4 items-center hover:bg-white/5 transition-colors text-sm ${
                          isCurrentUser(entry) ? 'bg-yellow-500/5 border-l-4 border-yellow-500' : ''
                        }`}
                      >
                        <div className={`font-bold text-lg flex items-center justify-center w-12 h-12 rounded-lg shrink-0 ${getRankBadgeClass(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </div>
                        <Avatar src={entry.avatar} name={entry.player} size="w-12 h-12" />
                        <div className="flex-grow font-semibold text-white truncate text-lg">{entry.player}</div>
                        <div className="flex items-center justify-center font-bold text-2xl text-orange-400">
                          <Flame className="w-5 h-5 mr-2" />
                          {entry.streak}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-gray-600"/>
                    <h3 className="text-lg font-semibold text-white">The Leaderboard is Empty</h3>
                    <p>Complete a challenge to be the first to start a streak!</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;