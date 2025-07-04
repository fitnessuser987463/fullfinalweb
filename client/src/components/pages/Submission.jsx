// src/pages/Submission.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Video, FileImage, X, CheckCircle, AlertTriangle, Clock, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';

const Submission = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionState, setSubmissionState] = useState('idle'); // 'idle', 'uploading', 'processing', 'complete'
  const [dragActive, setDragActive] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
      checkExistingSubmission();
    }
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/challenges/${challengeId}`);
      setChallenge(response.data);
      if (new Date(response.data.endTime) <= new Date()) {
        toast.error('This challenge has ended');
        navigate('/home');
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
      toast.error('Failed to load challenge details.');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSubmission = async () => {
    try {
      const response = await api.get(`/submissions/check/${challengeId}`);
      if (response.data.submitted) {
        toast.error('You have already submitted to this challenge.');
        navigate('/home');
      }
    } catch (error) {
      console.error('Error checking submission:', error);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedFile || !challenge || submissionState !== 'idle') return;

    setSubmissionState('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('challengeId', challengeId);

    try {
      const response = await api.post('/submissions', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) {
            setSubmissionState('processing');
          }
        },
      });

      if (response.data.score !== undefined) {
        updateUser({ currentStreak: response.data.score });
      }

      setSubmissionResult(response.data);
      setSubmissionState('complete');
      toast.success(`Submission successful! Your streak is now ${response.data.score}!`);

    } catch (error) {
      setSubmissionState('idle'); 
      setUploadProgress(0);
      console.error("Submission failed:", error);
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (file) => {
    // Add 'image/jpeg' to the list of valid types
    const allowedTypes = ['image/png', 'image/jpeg', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      // Update the error toast
      toast.error('Please select a valid image or video file. Turn off live mode on images.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FileImage className="w-8 h-8 text-blue-400" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-400" />;
    return <FileImage className="w-8 h-8 text-gray-400" />;
  };

  const formatTimeRemaining = (endTime) => {
    if (!endTime) return '...';
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (submissionState === 'complete' && submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
        <Header />
        <div className="container mx-auto px-6 py-8 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">
              <div className="w-16 h-16 bg-green-900/50 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Submission Complete!</h2>
              <p className="text-gray-400 mb-6">Your proof has been successfully submitted for review.</p>
              <div className="bg-green-900/50 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-white font-medium">Your streak is now: <span className="text-green-400 font-bold">{submissionResult.score}</span></p>
                <p className="text-gray-400 text-sm mt-1">Check your new rank on the leaderboard!</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => navigate('/leaderboard')} className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-black py-3 rounded-lg font-bold hover:shadow-lg transition-all">View Leaderboard</button>
                <button onClick={() => navigate('/home')} className="w-full bg-white/10 backdrop-blur-sm text-white py-3 rounded-lg font-semibold hover:bg-white/20 border border-white/20 transition-all">Back to Home</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSubmitting = submissionState === 'uploading' || submissionState === 'processing';
  
  let buttonText = 'Submit Proof';
  if (submissionState === 'uploading') buttonText = `Uploading... ${uploadProgress}%`;
  if (submissionState === 'processing') buttonText = 'Processing...';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Submit Your Proof</h1>
            <p className="text-xl text-gray-400">{challenge?.title}</p>
            <div className="flex items-center justify-center space-x-2 mt-4 text-amber-400">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{formatTimeRemaining(challenge?.endTime)} remaining</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Upload Your File</h2>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive ? 'border-amber-400 bg-amber-500/10' : 
                    selectedFile ? 'border-green-400 bg-green-500/10' : 
                    'border-white/20 hover:border-amber-400'
                  }`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrop} onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".png,.jpeg,.jpg,.mp4,.mov"
                    onChange={handleFileInputChange}
                    disabled={isSubmitting}
                  />
                  {!selectedFile ? (
                    <div>
                      <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">Drop your file here or click to browse</h3>
                      <p className="text-gray-500 mb-4">Video or Image (turn off live mode)  - max 100MB</p>
                      <button type="button" className="bg-amber-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors" onClick={() => fileInputRef.current?.click()}>Choose File</button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        {getFileIcon(selectedFile.type)}
                        <div className="text-left">
                          <p className="font-semibold text-white">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button onClick={removeFile} className="text-red-400 hover:text-red-500 transition-colors" disabled={isSubmitting}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      {isSubmitting && (
                        <div className="mb-4">
                          <div className="bg-gray-700 rounded-full h-2 mb-2"><div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div></div>
                          <p className="text-sm text-gray-400">Please keep this window open during upload.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <button 
                    onClick={handleSubmit} 
                    disabled={!selectedFile || isSubmitting} 
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center space-x-3
                      ${!selectedFile || isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg transform hover:scale-[1.02]'}`}>
                    {isSubmitting && <Loader2 className="animate-spin w-5 h-5" />}
                    <span>{buttonText}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2"><Info className="w-5 h-5 text-blue-400" /><span>Challenge Rules</span></h3>
                <div className="space-y-3">
                  {challenge?.rules?.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3"><div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-semibold text-amber-400">{index + 1}</span></div><span className="text-gray-300 text-sm">{rule}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-orange-900/50 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-400 mb-1">Final Submission</h4>
                    <p className="text-sm text-orange-400/80">Once submitted, your entry cannot be changed. Make it count!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submission;