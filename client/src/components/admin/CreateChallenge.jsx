import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateChallenge = ({ onChallengeCreated }) => {
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    rules: '',
    duration: '',
    endTime: '',
    maxScore: 100
  });
  const [createLoading, setCreateLoading] = useState(false);

  const handleInputChange = (e) => {
    setChallengeForm({
      ...challengeForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateChallenge = async () => {
    // Validate form
    if (!challengeForm.title || !challengeForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!challengeForm.endTime) {
      toast.error('Please set an end time for the challenge');
      return;
    }

    try {
      setCreateLoading(true);
      
      const challengeData = {
        ...challengeForm,
        rules: challengeForm.rules.split('\n').filter(rule => rule.trim()),
        endTime: new Date(challengeForm.endTime).toISOString()
      };

      await api.post('/challenges', challengeData);
      
      toast.success('Challenge created successfully!');
      
      // Reset form
      setChallengeForm({
        title: '',
        description: '',
        rules: '',
        duration: '',
        endTime: '',
        maxScore: 100
      });

      // Notify parent component
      if (onChallengeCreated) {
        onChallengeCreated();
      }
    } catch (error) {
      toast.error('Failed to create challenge');
      console.error('Create challenge error:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Challenge</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Challenge Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Title *
              </label>
              <input
                type="text"
                name="title"
                value={challengeForm.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Sunset Snapshot Challenge"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={challengeForm.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe what participants need to capture..."
              />
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rules (one per line)
              </label>
              <textarea
                name="rules"
                value={challengeForm.rules}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Must be original content taken today&#10;Submit as PNG or MP4&#10;No filters or heavy editing"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Challenge Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Duration (optional)
              </label>
              <select
                name="duration"
                value={challengeForm.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select duration</option>
                <option value="1h">1 Hour</option>
                <option value="6h">6 Hours</option>
                <option value="12h">12 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="48h">48 Hours</option>
                <option value="1w">1 Week</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Suggested duration for the challenge</p>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={challengeForm.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Maximum Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Score
              </label>
              <input
                type="number"
                name="maxScore"
                value={challengeForm.maxScore}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Preview Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Preview</h4>
              <div className="bg-white rounded-lg p-4 border">
                <h5 className="font-bold text-lg mb-2">
                  {challengeForm.title || 'Challenge Title'}
                </h5>
                <p className="text-gray-600 text-sm mb-3">
                  {challengeForm.description || 'Challenge description will appear here...'}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Max: {challengeForm.maxScore} pts</span>
                  {challengeForm.duration && <span>Duration: {challengeForm.duration}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <button 
            onClick={() => setChallengeForm({
              title: '',
              description: '',
              rules: '',
              duration: '',
              endTime: '',
              maxScore: 100
            })}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            disabled={createLoading}
          >
            Clear Form
          </button>
          <button
            onClick={handleCreateChallenge}
            disabled={createLoading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            {createLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Create Challenge</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChallenge;