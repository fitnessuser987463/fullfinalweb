import React from 'react';
import { Trophy, Users, Zap, Star, Camera } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Ambient Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" />
              <span className="text-2xl font-bold text-white tracking-wide">Fit Rank</span>
            </div>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Enter the Arena
            </button>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6">
              7 Days. 7 Challenges.
              <br />
              <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-400 bg-clip-text text-transparent">
                One Leaderboard.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Compete daily in fitness challenges to build consistency and a fitness streak. 
              A new challenge drops every day at 8 AM EST
            </p>

            {/* Social Proof Stats */}
            <div className="flex justify-center items-center gap-12 my-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">1K+</p>
                  <p className="text-sm text-gray-400 tracking-wider">Competitors</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                  <Camera className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">5K+</p>
                  <p className="text-sm text-gray-400 tracking-wider">Submissions</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-10 py-4 rounded-full text-lg font-semibold hover:scale-105 hover:shadow-2xl transition-all"
            >
              Join the Challenge
            </button>
          </div>
        </div>
      </div>

      {/* Get the App Section */}
      <section className="py-20 bg-gradient-to-br from-gray-950 to-black text-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-bold mb-4">How to Get the App</h2>
            <p className="text-lg text-gray-300 mb-6">
              We are releasing the app soon on ios and android! In the meantime, follow the steps below or watch our video to add Fit Rank to your homescreen!
            </p>
            <ul className="text-gray-400 list-disc list-inside space-y-2 text-left">
              <li>Open Fit Rank in your mobile browser</li>
              <li>Tap the share icon or browser menu</li>
              <li>Select “Add to Home Screen”</li>
              <li>Launch the app like any native app!</li>
            </ul>
          </div>

          {/* Right Content - Responsive YouTube Embed */}
          <div className="md:w-1/2 w-full">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg border border-white/10"
                src="https://www.youtube.com/embed/fBJEqtEYm_U"
                title="How to Get the Fit Rank App"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="bg-white/5 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Join Fit Rank?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            Built for competitors. Designed for discipline. Fueled by the thrill of the game.
          </p>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="bg-white/10 p-8 rounded-2xl border border-white/10 hover:scale-105 transition">
              <div className="mb-4">
                <Zap className="w-10 h-10 text-yellow-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3">High-Stakes Fitness</h3>
              <p className="text-gray-300">
                Each day unlocks a new challenge designed to push your limits. Perform or fall behind.
              </p>
            </div>
            <div className="bg-white/10 p-8 rounded-2xl border border-white/10 hover:scale-105 transition">
              <div className="mb-4">
                <Trophy className="w-10 h-10 text-red-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Climb the Leaderboard</h3>
              <p className="text-gray-300">
                Every rep counts. Points fuel your rank. Consistency wins the crown.
              </p>
            </div>
            <div className="bg-white/10 p-8 rounded-2xl border border-white/10 hover:scale-105 transition">
              <div className="mb-4">
                <Users className="w-10 h-10 text-green-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Compete Globally</h3>
              <p className="text-gray-300">
                Go head-to-head with fitness challengers across the globe. Rise above or get left behind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-10">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-10 max-w-5xl mx-auto">
            <div>
              <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Join the Series</h4>
              <p className="text-gray-400">Sign up and prepare for 7 days of relentless challenge.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-yellow-400/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Show Your Proof</h4>
              <p className="text-gray-400">Submit video or photo evidence to validate your efforts.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-green-400/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Earn Points</h4>
              <p className="text-gray-400">Get scored based on effort, accuracy, and consistency.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Climb or Fall</h4>
              <p className="text-gray-400">Watch your rank rise—or plummet—on the global board.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-red-600 to-yellow-500 py-20 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Think You Can Survive?</h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Join thousands in a one-of-a-kind fitness gauntlet. No second chances. Only the strong finish.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-white text-black px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition"
        >
          Enter the Arena
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-8 border-t border-white/10">
  <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
    <p className="mb-4 md:mb-0">
      © 2025 Fit Rank. All rights reserved.
    </p>
    <div className="flex items-center gap-x-6">
      <a
        href="mailto:fitrankhelp@gmail.com"
        className="hover:text-white transition-colors"
      >
        Contact Us: fitrankhelp@gmail.com
      </a>
      <a
        href="https://fitranktermsprivacy.wixsite.com/fitranktermsprivacy"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white transition-colors"
      >
        Terms of Service
      </a>
      <a
        href="https://fitranktermsprivacy.wixsite.com/fitranktermsprivacy"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white transition-colors"
      >
        Privacy Policy
      </a>
    </div>
  </div>
</footer>

    </div>
  );
};

export default Landing;
