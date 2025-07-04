import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, Globe, Camera, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';

const Notifications = () => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    sms: false,
    email: true,
    push: true,
    phone: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      if (user) {
        setSettings({
          sms: user.notificationSettings?.sms || false,
          email: user.notificationSettings?.email || true,
          push: user.notificationSettings?.push || true,
          phone: user.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePhoneChange = (e) => {
    setSettings(prev => ({
      ...prev,
      phone: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await api.put('/users/notifications', settings);
      
      // Update user context
      updateUser({
        notificationSettings: {
          sms: settings.sms,
          email: settings.email,
          push: settings.push
        },
        phone: settings.phone
      });

      setSaveSuccess(true);
      toast.success('Notification settings updated successfully!');
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      toast.error('Failed to update notification settings');
      console.error('Save settings error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationTypes = [
    {
      id: 'new_challenges',
      title: 'New Challenges',
      description: 'Get notified when new challenges are available',
      icon: Camera,
      color: 'text-purple-600'
    },
    {
      id: 'challenge_reminders',
      title: 'Challenge Reminders',
      description: 'Reminders before challenges end',
      icon: Bell,
      color: 'text-blue-600'
    },
    {
      id: 'leaderboard_updates',
      title: 'Leaderboard Updates',
      description: 'When your ranking changes or you achieve milestones',
      icon: Globe,
      color: 'text-green-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
  <Header />

  <div className="container mx-auto px-6 py-10">
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
          <Bell className="w-10 h-10 text-yellow-400" />
          <span>Notification Settings</span>
        </h1>
        <p className="text-lg text-gray-400">Customize how you receive updates and alerts</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 bg-green-500/10 border border-green-400/30 text-green-300 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Main Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold mb-6">Notification Methods</h2>

          <div className="space-y-6">
            {/* SMS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Text Notifications</h3>
                  <p className="text-gray-400">Receive text messages for important updates (coming soon)</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sms')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.sms ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.sms ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Phone Input */}
            {settings.sms && (
              <div className="ml-16 bg-white/5 border border-white/10 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number (for SMS)
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter your phone number"
                />
              </div>
            )}

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email Notifications</h3>
                  <p className="text-gray-400">Receive email updates and summaries</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.email ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Push */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-400/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Push Notifications</h3>
                  <p className="text-gray-400">Receive browser notifications</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.push ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">What You'll Receive</h2>

          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div
                key={type.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center space-x-4"
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-inner">
                  <type.icon className={`w-5 h-5 ${type.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{type.title}</h3>
                  <p className="text-sm text-gray-400">{type.description}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-yellow-500 to-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      

      {/* Quick Actions */}
      
    </div>
  </div>
</div>
  );
};

export default Notifications;