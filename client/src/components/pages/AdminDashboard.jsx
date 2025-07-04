import React, { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, Edit, Crown, Camera, Settings, Users, Clock, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CreateChallenge from './CreateChallenge';
import Header from '../common/Header'; // Assuming you might use the shared Header

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [existingChallenges, setExistingChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchChallenges();
    }
  }, [activeTab]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const allResponse = await api.get('/challenges/all');
      const allChallenges = allResponse.data || [];
      allChallenges.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setExistingChallenges(allChallenges);
    } catch (error) {
      toast.error('Failed to fetch challenges');
      console.error('Fetch challenges error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/50 text-green-400 border border-green-500/30';
      case 'upcoming':
        return 'bg-amber-900/50 text-amber-400 border border-amber-500/30';
      case 'completed':
        return 'bg-gray-700/50 text-gray-400 border border-gray-600/30';
      default:
        return 'bg-gray-700/50 text-gray-400 border border-gray-600/30';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      <Header /> {/* Using the shared, themed header */}
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
            <Settings className="w-10 h-10 text-amber-400" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-xl text-gray-400">Manage challenges and monitor platform activity.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-900/50 rounded-lg p-1 border border-white/10 max-w-md mx-auto">
            <button 
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'create' 
                  ? 'bg-amber-500/10 text-amber-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Challenge
            </button>
            <button 
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'manage' 
                  ? 'bg-amber-500/10 text-amber-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Manage Challenges
            </button>
          </div>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <CreateChallenge onChallengeCreated={() => { fetchChallenges(); setActiveTab('manage'); }} />
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Challenge Management</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">{existingChallenges.length} total</span>
                    <button 
                      onClick={() => setActiveTab('create')}
                      className="bg-amber-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New</span>
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading challenges...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider">Challenge</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider">Participants</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider">Time Left</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {existingChallenges.map((challenge) => (
                        <tr key={challenge._id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-white">{challenge.title}</div>
                            <div className="text-xs text-gray-400">{formatDate(challenge.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(challenge.status)}`}>
                              {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1 text-gray-300">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{challenge.totalParticipants || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1 text-amber-400">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{formatTimeRemaining(challenge.endTime)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                              <button className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {existingChallenges.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No challenges found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;