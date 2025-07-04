// src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, Users, Trophy, Upload, CheckCircle, AlertCircle, Award, Target, RefreshCw, History, Zap } from 'lucide-react';
// MODIFIED: Import useAuth to get full auth status
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Header from '../common/Header';
import CountdownTimer from '../common/CountdownTimer';

const Home = () => {
  const navigate = useNavigate();
  // MODIFIED: Get full auth status including loading and isAuthenticated
  const { user, updateUser, isAuthenticated, loading: authLoading } = useAuth();
  const { socket, joinChallenge } = useSocket();
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [upcomingChallenges, setUpcomingChallenges] = useState([]);
  const [previousChallenges, setPreviousChallenges] = useState([]);
  const [userStats, setUserStats] = useState({
    currentRank: null,
    totalScore: 0,
    challengesWon: 0,
    totalSubmissions: 0
  });
  const [userSubmission, setUserSubmission] = useState(null);
  const [userJoined, setUserJoined] = useState(false);
  // MODIFIED: Main loading state is now initially true
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    try {
      // Fetch all required data in parallel
      const [
        currentChallengeRes,
        upcomingChallengesRes,
        previousChallengesRes,
        userStatsRes
      ] = await Promise.all([
        api.get('/challenges/active').catch(e => e), // Catch errors to not fail all
        api.get('/challenges/upcoming').catch(e => e),
        api.get('/challenges/current').catch(e => e), // For previous challenges
        api.get('/users/stats').catch(e => e)
      ]);

      if (currentChallengeRes?.data) {
        setCurrentChallenge(currentChallengeRes.data);
      } else {
        setCurrentChallenge(null);
      }

      if (upcomingChallengesRes?.data) {
        setUpcomingChallenges(upcomingChallengesRes.data.slice(0, 3));
      }

      if (previousChallengesRes?.data) {
        const otherChallenges = previousChallengesRes.data.filter(challenge => {
            if (currentChallengeRes?.data && challenge._id === currentChallengeRes.data._id) {
                return false;
            }
            return challenge.status === 'completed' || new Date(challenge.endTime) <= new Date();
        });
        const sortedPrevious = otherChallenges.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setPreviousChallenges(sortedPrevious);
      }

      if (userStatsRes?.data) {
        setUserStats(userStatsRes.data);
      }

    } catch (error) {
      // This will catch any unhandled promise rejections, though we try to handle them individually
      console.error("Error fetching homepage data:", error);
      toast.error("Could not load all page data.");
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };
  
  // --- FIX: This is the main logic fix ---
  useEffect(() => {
    // Only fetch data if the user is authenticated and the initial auth check is done.
    if (isAuthenticated && !authLoading) {
        fetchAllData();
    }
  }, [isAuthenticated, authLoading]); // This effect now depends on the auth state

  // Socket logic remains the same but will only run after the initial data fetch succeeds
  useEffect(() => {
    if (currentChallenge && socket) {
      joinChallenge(currentChallenge._id);
      checkUserSubmission();
      getUserRank();

      const onChallengeUpdate = (data) => {
        if (data.challengeId === currentChallenge._id) {
          setCurrentChallenge(prev => ({ ...prev, ...data }));
        }
      };
      
      const onNewChallenge = () => fetchAllData();
      const onStatusUpdate = () => fetchAllData();
      
      socket.on('challenge_update', onChallengeUpdate);
      socket.on('new_challenge', onNewChallenge);
      socket.on('challenge_status_update', onStatusUpdate);

      return () => {
        socket.off('challenge_update', onChallengeUpdate);
        socket.off('new_challenge', onNewChallenge);
        socket.off('challenge_status_update', onStatusUpdate);
      };
    }
  }, [currentChallenge, socket]);
  
  // Other functions (checkUserSubmission, getUserRank, etc.) remain unchanged
  const checkUserSubmission = async () => {
    if (!currentChallenge || !user?._id) return;
    try {
      const response = await api.get(`/submissions/check/${currentChallenge._id}`);
      setUserSubmission(response.data.submission);
      const isJoined = currentChallenge.participants?.some(p => p.user === user._id || p.user?._id === user._id);
      setUserJoined(isJoined);
    } catch (error) { console.error('Error checking submission:', error); }
  };

  const getUserRank = async () => {
    if (!currentChallenge || !user?._id) return;
    try {
      const response = await api.get(`/leaderboard/rank/${user._id}`);
      setUserStats(prev => ({...prev, currentRank: response.data.rank}));
    } catch (error) { console.error('Error fetching user rank:', error); }
  };

  const handleJoinChallenge = async () => {
    if (!currentChallenge) return;
    try {
      await api.post(`/challenges/${currentChallenge._id}/join`);
      setUserJoined(true);
      setCurrentChallenge(prev => ({...prev, totalParticipants: (prev.totalParticipants || 0) + 1, participants: [...(prev.participants || []), { user: user._id, joinedAt: new Date() }]}));
      toast.success('Successfully joined the challenge!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to join challenge'); }
  };

  const handleSubmitProof = () => { if (currentChallenge) navigate(`/submission/${currentChallenge._id}`); };
  const refreshChallenges = () => { setRefreshing(true); fetchAllData(); };
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-400 border border-green-500/30';
      case 'upcoming': return 'bg-amber-900/50 text-amber-400 border border-amber-500/30';
      case 'completed': return 'bg-gray-700/50 text-gray-400 border border-gray-600/30';
      default: return 'bg-gray-700/50 text-gray-400 border border-gray-600/30';
    }
  };

  // The main loading state now correctly waits for authentication to finish first
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- JSX REMAINS THE SAME ---
  // The logic inside the JSX for displaying data is already robust enough to handle
  // cases where `currentChallenge` is null, so no changes are needed there.
  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">No Active Challenge</h2>
            <p className="text-gray-400 mb-8">Check back soon for the next series!</p>
            <button onClick={refreshChallenges} className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/20 flex items-center space-x-2 mx-auto mb-8" disabled={refreshing}>
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Challenges'}</span>
            </button>
            {previousChallenges.length > 0 && (
              <div className="max-w-4xl mx-auto mt-12">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center space-x-2"><History className="w-6 h-6 text-red-400" /><span>Recent Challenges</span></h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previousChallenges.map((challenge) => (
                    <div key={challenge._id} className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">{challenge.title}</h4>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{challenge.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>{challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}</span>
                        <span className="text-gray-500">Ended {formatDate(challenge.endTime)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-end mb-4">
          <button onClick={refreshChallenges} className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/20 flex items-center space-x-2" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-orange-900 to-orange-700 text-white p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{currentChallenge.title}</h1>
                    <p className="text-white/80 text-lg">{currentChallenge.description}</p>
                  </div>
                  <div className="text-right"><CountdownTimer endTime={currentChallenge.endTime} onComplete={refreshChallenges}/></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center"><Users className="w-6 h-6 mx-auto mb-1 text-green-300" /><div className="text-2xl font-bold">{currentChallenge.totalParticipants || 0}</div><div className="text-sm text-white/80">Participants</div></div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center"><Target className="w-6 h-6 mx-auto mb-1 text-amber-300" /><div className="text-2xl font-bold">{currentChallenge.maxScore}</div><div className="text-sm text-white/80">Max Points</div></div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center"><Award className="w-6 h-6 mx-auto mb-1 text-red-300" /><div className="text-2xl font-bold">{userStats.currentRank ? `#${userStats.currentRank}` : '-'}</div><div className="text-sm text-white/80">Your Rank</div></div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-8"><h3 className="text-xl font-bold text-white mb-4 flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-red-400" />Challenge Rules</h3><div className="space-y-3">{currentChallenge.rules?.map((rule, index) => (<div key={index} className="flex items-start space-x-3"><div className="w-6 h-6 bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-semibold text-red-300">{index + 1}</span></div><span className="text-gray-300">{rule}</span></div>))}</div></div>
                <div className="space-y-4">
                  {!userJoined ? (<div className="space-y-3"><button onClick={handleJoinChallenge} className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"><span className="flex items-center justify-center space-x-2"><Trophy className="w-5 h-5" /><span>Join Challenge</span></span></button><button disabled className="w-full bg-gray-700/50 text-gray-500 py-4 rounded-xl font-semibold text-lg cursor-not-allowed"><span className="flex items-center justify-center space-x-2"><Upload className="w-5 h-5" /><span>Submit Your Proof</span></span></button></div>) 
                  : !userSubmission ? (<div className="space-y-3"><div className="flex items-center space-x-2 text-green-400 bg-green-900/50 p-3 rounded-lg border border-green-500/30"><CheckCircle className="w-5 h-5" /><span className="font-medium">Challenge Joined! Time to compete.</span></div><button onClick={handleSubmitProof} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 animate-pulse"><span className="flex items-center justify-center space-x-2"><Upload className="w-5 h-5" /><span>Submit Your Proof</span></span></button></div>) 
                  : (<div className="space-y-3"><div className="flex items-center space-x-2 text-amber-400 bg-amber-900/50 p-3 rounded-lg border border-amber-500/30"><CheckCircle className="w-5 h-5" /><span className="font-medium">Submission Complete! Score: {userSubmission.score}</span></div><button disabled className="w-full bg-gray-700/50 text-gray-500 py-4 rounded-xl font-semibold text-lg cursor-not-allowed">Already Submitted</button></div>)}
                </div>
              </div>
            </div>
            {previousChallenges.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2"><History className="w-6 h-6 text-red-400" /><span>Previous Challenges</span></h3>
                <div className="grid md:grid-cols-2 gap-4">{previousChallenges.map((challenge) => (<div key={challenge._id} className="bg-gray-900/50 border border-white/10 rounded-lg p-4 hover:border-amber-400 transition-colors"><div className="flex justify-between items-start mb-3"><h4 className="font-semibold text-white">{challenge.title}</h4><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>{challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}</span></div><p className="text-sm text-gray-400 mb-3 line-clamp-2">{challenge.description}</p></div>))}</div>
                <div className="mt-4 text-center"><button onClick={() => navigate('/challenges')} className="text-amber-400 hover:text-amber-300 font-medium text-sm hover:underline">View All Challenges →</button></div>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/10"><h3 className="text-xl font-bold text-white mb-4">Your Stats</h3><div className="space-y-4 text-gray-300"><div className="flex justify-between items-center"><span className="font-medium">Current Rank</span><span className="text-2xl font-bold text-red-400">{userStats.currentRank ? `#${userStats.currentRank}` : '-'}</span></div><div className="flex justify-between items-center"><span className="font-medium">Total Score</span><span className="text-2xl font-bold text-green-400">{userStats.totalScore}</span></div><div className="flex justify-between items-center"><span className="font-medium">Challenges Won</span><span className="text-xl font-semibold text-amber-400">{userStats.challengesWon}</span></div><div className="flex justify-between items-center"><span className="font-medium">Total Submissions</span><span className="text-xl font-semibold text-gray-100">{userStats.totalSubmissions}</span></div></div></div>
            {upcomingChallenges.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/10"><h3 className="text-xl font-bold text-white mb-4">Upcoming</h3><div className="space-y-4">{upcomingChallenges.map((challenge) => (<div key={challenge._id} className="bg-gray-900/50 border border-white/10 rounded-lg p-4 hover:border-amber-400 transition-colors"><h4 className="font-semibold text-white mb-2">{challenge.title}</h4><p className="text-sm text-gray-400 mb-3">{challenge.description}</p><div className="flex justify-between items-center text-sm"><span className="text-amber-400 font-medium">Starts in {formatTimeRemaining(challenge.startTime)}</span><span className="text-gray-500 flex items-center gap-1"><Users size={14}/> {challenge.totalParticipants || 0}</span></div></div>))}</div></div>
            )}
            <div className="bg-gradient-to-r from-orange-900 to-orange-700 rounded-2xl p-6 text-white"><h3 className="text-lg font-bold mb-4">Quick Actions</h3><div className="space-y-3"><button onClick={() => navigate('/leaderboard')} className="w-full bg-white/20 backdrop-blur-sm py-3 rounded-lg font-medium hover:bg-white/30 transition-colors">View Leaderboard</button><button onClick={() => navigate('/challenges')} className="w-full bg-white/20 backdrop-blur-sm py-3 rounded-lg font-medium hover:bg-white/30 transition-colors">All Challenges</button>{user?.role === 'admin' && (<button onClick={() => navigate('/admin')} className="w-full bg-white/20 backdrop-blur-sm py-3 rounded-lg font-medium hover:bg-white/30 transition-colors">Admin Panel</button>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;