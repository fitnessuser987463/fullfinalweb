// src/pages/AllChallenges.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, Users, Trophy, Target, CheckCircle, XCircle, Calendar, Search, Filter, RefreshCw } from 'lucide-react';
// MODIFIED: Import useAuth to get full auth status
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Header from '../common/Header';

const AllChallenges = () => {
  const navigate = useNavigate();
  // MODIFIED: Get full auth status
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  // MODIFIED: Main loading state is now initially true
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // --- FIX: This is the main logic fix ---
  useEffect(() => {
    // Only fetch data if the user is authenticated and the initial auth check is done.
    if (isAuthenticated && !authLoading) {
      fetchAllChallenges();
    }
  }, [isAuthenticated, authLoading]); // This effect now depends on the auth state

  useEffect(() => {
    filterChallenges();
  }, [challenges, searchTerm, statusFilter]);

  const fetchAllChallenges = async () => {
    try {
      setLoading(true);
      // Using public endpoints that don't require admin role
      const [currentResponse, allResponse] = await Promise.all([
        api.get('/challenges/current').catch(() => ({ data: [] })),
        api.get('/challenges/all').catch(() => ({ data: [] }))
      ]);

      const currentChallenges = Array.isArray(currentResponse.data) ? currentResponse.data : [];
      const allChallenges = Array.isArray(allResponse.data) ? allResponse.data : [];

      const challengeMap = new Map();
      allChallenges.forEach(challenge => challengeMap.set(challenge._id, { ...challenge, isRecent: false }));
      currentChallenges.forEach(challenge => challengeMap.set(challenge._id, { ...challenge, isRecent: true }));
      
      const allCombined = Array.from(challengeMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setChallenges(allCombined);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterChallenges = () => {
    let filtered = challenges;
    if (searchTerm) {
      filtered = filtered.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    setFilteredChallenges(filtered);
  };

  const refreshChallenges = async () => {
    setRefreshing(true);
    await fetchAllChallenges();
    toast.success('Challenges refreshed!');
  };

  // Other functions (getStatusColor, handleJoinChallenge, etc.) remain unchanged
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900 text-green-400 border-green-700';
      case 'upcoming': return 'bg-blue-900 text-blue-400 border-blue-700';
      case 'completed': return 'bg-gray-800 text-gray-400 border-gray-700';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'upcoming': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'completed': return <XCircle className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatTimeRemaining = (endTime) => {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  const handleChallengeClick = (challenge) => {
    if (challenge.status === 'active') navigate('/home');
    else toast.info(`This challenge is ${challenge.status}`);
  };
  const handleJoinChallenge = async (challengeId, e) => {
    e.stopPropagation();
    try {
      await api.post(`/challenges/${challengeId}/join`);
      toast.success('Successfully joined the challenge!');
      await fetchAllChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join challenge');
    }
  };

  // The main loading state now correctly waits for authentication to finish first
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- JSX REMAINS THE SAME ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-700 rounded-full opacity-20 filter blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-10 w-64 h-64 bg-green-700 rounded-full opacity-20 filter blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-amber-600 rounded-full opacity-20 filter blur-3xl animate-pulse animation-delay-4000"></div>
      <Header />
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3"><Camera className="w-10 h-10 text-red-500" /><span>All Challenges</span></h1>
          <p className="text-gray-400 text-xl">Browse and participate in fitness challenges</p>
        </div>
        <div className="mb-8 bg-black bg-opacity-70 rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search challenges..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg bg-transparent placeholder-gray-400 text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"/>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-10 pr-8 py-3 border border-gray-700 rounded-lg bg-transparent placeholder-gray-400 text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none">
                <option className="bg-black text-gray-300" value="all">All Status</option>
                <option className="bg-black text-gray-300" value="active">Active</option>
                <option className="bg-black text-gray-300" value="upcoming">Upcoming</option>
                <option className="bg-black text-gray-300" value="completed">Completed</option>
              </select>
            </div>
            <button onClick={refreshChallenges} disabled={refreshing} className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-400">Showing {filteredChallenges.length} of {challenges.length} challenges</div>
        </div>
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-20"><Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-2xl font-bold text-gray-300 mb-2">No Challenges Found</h3><p className="text-gray-400">Try adjusting your search or filter criteria</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <div key={challenge._id} onClick={() => handleChallengeClick(challenge)} className={`bg-black bg-opacity-70 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-2 ${challenge.isRecent ? 'border-amber-500 bg-amber-900 bg-opacity-20' : 'border-transparent'}`}>
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2"><h3 className="text-xl font-bold text-white line-clamp-1">{challenge.title}</h3>{challenge.isRecent && (<span className="bg-amber-700 text-amber-300 text-xs px-2 py-1 rounded-full font-medium">Recent</span>)}</div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{challenge.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(challenge.status)}`}>{getStatusIcon(challenge.status)}<span className="capitalize">{challenge.status}</span></div>
                    <div className="text-sm text-gray-500"><Calendar className="w-4 h-4 inline mr-1" />{formatDate(challenge.createdAt)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center"><div className="flex items-center justify-center space-x-1"><Users className="w-4 h-4 text-red-500" /><span className="font-bold text-red-400">{challenge.totalParticipants || 0}</span></div><span className="text-xs text-gray-400">Participants</span></div>
                    <div className="text-center"><div className="flex items-center justify-center space-x-1"><Target className="w-4 h-4 text-green-400" /><span className="font-bold text-green-300">{challenge.maxScore}</span></div><span className="text-xs text-gray-400">Max Points</span></div>
                    <div className="text-center"><div className="flex items-center justify-center space-x-1"><Trophy className="w-4 h-4 text-amber-400" /><span className="font-bold text-amber-300">{challenge.totalSubmissions || 0}</span></div><span className="text-xs text-gray-400">Submissions</span></div>
                  </div>
                  <div className="mb-4">
                    {challenge.status === 'active' && (<div className="flex items-center justify-center space-x-2 text-amber-400 bg-amber-900 bg-opacity-30 py-2 rounded-lg"><Clock className="w-4 h-4" /><span className="font-semibold text-sm text-white">{formatTimeRemaining(challenge.endTime)} remaining</span></div>)}
                    {challenge.status === 'upcoming' && (<div className="flex items-center justify-center space-x-2 text-blue-400 bg-blue-900 bg-opacity-30 py-2 rounded-lg"><Clock className="w-4 h-4" /><span className="font-semibold text-sm text-white">Starts on {formatDate(challenge.startTime)}</span></div>)}
                    {challenge.status === 'completed' && (<div className="flex items-center justify-center space-x-2 text-gray-400 bg-gray-900 bg-opacity-30 py-2 rounded-lg"><Clock className="w-4 h-4" /><span className="font-semibold text-sm text-gray-400">Ended on {formatDate(challenge.endTime)}</span></div>)}
                  </div>
                  {challenge.status === 'active' && !challenge.joined && (<button onClick={(e) => handleJoinChallenge(challenge._id, e)} className="w-full py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-red-600 via-amber-400 to-amber-500 hover:from-red-700 hover:via-amber-500 hover:to-amber-600 transition-colors">Join Challenge</button>)}
                  {challenge.status === 'active' && challenge.joined && (<div className="w-full py-3 rounded-lg font-semibold text-white bg-green-700 text-center">Joined</div>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllChallenges;