import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Users, Settings, Eye, Trash2, Edit, Crown, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CreateChallenge from './CreateChallenge';

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
      const response = await api.get('/challenges/all');
      setExistingChallenges(response.data);
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
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">Fit Rank</span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Crown className="w-4 h-4" />
                <span>Admin</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/home'}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Public View
              </button>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-3">
            <Settings className="w-10 h-10 text-purple-600" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600">Manage challenges and monitor platform activity</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm max-w-md mx-auto">
            <button 
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'create' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Challenge
            </button>
            <button 
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'manage' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Manage
            </button>
          </div>
        </div>

        {/* Create Challenge Tab */}
        {activeTab === 'create' && (
          <CreateChallenge onChallengeCreated={() => {
            if (activeTab === 'manage') {
              fetchChallenges();
            }
          }} />
        )}

        {/* Manage Challenges Tab */}
        {activeTab === 'manage' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Challenge Management</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {existingChallenges.length} total challenges
                    </span>
                    <button 
                      onClick={() => setActiveTab('create')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Challenge</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Challenges Table */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading challenges...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Challenge
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Submissions
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Time Left
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {existingChallenges.map((challenge) => (
                        <tr key={challenge._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-800">{challenge.title}</div>
                              <div className="text-sm text-gray-500">Created {formatDate(challenge.createdAt)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(challenge.status)}`}>
                              {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{challenge.totalParticipants || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{challenge.totalSubmissions || 0}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span className="text-amber-600 font-medium">
                                {formatTimeRemaining(challenge.endTime)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Challenge"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit Challenge"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Challenge"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {existingChallenges.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No challenges created yet. Create your first challenge!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Stats Cards */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {existingChallenges.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Challenges</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {existingChallenges.reduce((sum, c) => sum + (c.totalParticipants || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Participants</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {existingChallenges.reduce((sum, c) => sum + (c.totalSubmissions || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Submissions</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {existingChallenges.filter(c => c.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Challenges</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;