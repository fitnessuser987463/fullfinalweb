import React, { useState, useRef } from 'react';
import { Upload, Camera, Video, FileImage, X, CheckCircle, AlertTriangle, Clock, Info } from 'lucide-react';

const SubmissionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const challengeInfo = {
    title: "Sunset Snapshot Challenge",
    timeRemaining: "21h 45m",
    rules: [
      "Must be original content taken today",
      "Submit as PNG, MP4, or MOV only",
      "No filters or heavy editing",
      "Faster submissions earn more points"
    ],
    maxFileSize: "100MB",
    acceptedFormats: ["PNG", "MP4", "MOV"]
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = ['image/png', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a PNG image, MP4, or MOV video file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    simulateUpload();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="w-8 h-8 text-purple-500" />;
    }
    return <FileImage className="w-8 h-8 text-gray-500" />;
  };

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Submission Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your {selectedFile?.type.startsWith('image/') ? 'photo' : 'video'} has been successfully submitted to the challenge.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">Good luck in the competition!</p>
              <p className="text-green-600 text-sm">You can check your ranking on the leaderboard.</p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/leaderboard'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                View Leaderboard
              </button>
              <button 
                onClick={() => window.location.href = '/home'}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            </div>
            
            <button 
              onClick={() => window.location.href = '/home'}
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              ← Back to Challenge
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Submit Your Proof</h1>
            <p className="text-xl text-gray-600">{challengeInfo.title}</p>
            <div className="flex items-center justify-center space-x-2 mt-4 text-amber-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{challengeInfo.timeRemaining} remaining</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Your File</h2>

                {/* Upload Area */}
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-50' 
                      : selectedFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".png,.mp4,.mov"
                    onChange={handleFileInputChange}
                    disabled={isUploading}
                  />

                  {!selectedFile ? (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Drop your file here or click to browse
                      </h3>
                      <p className="text-gray-500 mb-4">PNG images, MP4 or MOV videos only</p>
                      <button 
                        type="button"
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        {getFileIcon(selectedFile.type)}
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          disabled={isUploading}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="mb-4">
                          <div className="bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">Uploading... {Math.round(uploadProgress)}%</p>
                        </div>
                      )}

                      {/* Preview */}
                      {selectedFile.type.startsWith('image/') && (
                        <div className="mt-4">
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Preview" 
                            className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isUploading}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                      selectedFile && !isUploading
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isUploading ? 'Uploading...' : 'Submit Proof'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Challenge Rules */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <span>Challenge Rules</span>
                </h3>
                <div className="space-y-3">
                  {challengeInfo.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 text-sm">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Requirements */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">File Requirements</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accepted Formats</span>
                    <div className="flex space-x-2">
                      {challengeInfo.acceptedFormats.map(format => (
                        <span key={format} className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-medium">
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Max File Size</span>
                    <span className="font-semibold text-gray-800">{challengeInfo.maxFileSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time Remaining</span>
                    <span className="font-semibold text-amber-600">{challengeInfo.timeRemaining}</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">💡 Pro Tips</h3>
                <div className="space-y-3 text-sm">
                  <p>• Submit early to earn bonus points for speed</p>
                  <p>• Make sure your photo/video clearly shows the challenge subject</p>
                  <p>• Natural lighting often works better than flash</p>
                  <p>• Double-check that your submission follows all rules</p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Important</h4>
                    <p className="text-sm text-amber-700">
                      Once submitted, you cannot change your entry. Make sure you're happy with your submission before clicking submit.
                    </p>
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

export default SubmissionPage;
