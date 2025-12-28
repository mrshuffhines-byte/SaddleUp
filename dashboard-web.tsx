'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Trophy, 
  Calendar, 
  Flame, 
  Bot, 
  MessageCircle, 
  FileText, 
  BookOpen,
  Menu,
  X
} from 'lucide-react';

// User data (in real app, fetch from API)
const USER_DATA = {
  name: 'Stacie',
  email: 'stacie@example.com',
  stats: {
    skills: 0,
    sessions: 0,
    streak: 0,
  },
  quote: "Listen to your horse more than you speak to them. They're telling you if the approach is working.",
};

const DAILY_TIPS = [
  "Remember: consistency beats intensity. Short, regular sessions build trust faster than long, sporadic ones.",
  "Always end on a positive note, even if it's just one small success. Your horse remembers the last interaction.",
  "Take time to observe your horse before starting. Their body language tells you what they need.",
  "Progress isn't linear - both you and your horse will have good days and challenging days. That's normal!",
  "When things get frustrating, go back to something your horse knows well. Rebuilding confidence helps move forward.",
  "Groundwork is never wasted time. A solid foundation on the ground makes everything under saddle easier.",
  USER_DATA.quote,
];

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dailyTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-serif font-bold text-stone-900">Rein</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <a href="#" className="text-stone-900 font-medium border-b-2 border-stone-900 pb-1">Dashboard</a>
              <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">My Plan</a>
              <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Sessions</a>
              <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Library</a>
              <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Ask a Trainer</a>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center font-semibold">
                {USER_DATA.name.charAt(0)}
              </div>
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-stone-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-stone-200">
              <div className="flex flex-col space-y-3">
                <a href="#" className="text-stone-900 font-medium">Dashboard</a>
                <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">My Plan</a>
                <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Sessions</a>
                <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Library</a>
                <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Ask a Trainer</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-gradient-to-br from-stone-600 to-stone-800 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1516728788616-9a2c07a5d5d8?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-stone-900/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2">
            Welcome back, {USER_DATA.name}! 👋
          </h1>
          <p className="text-lg md:text-xl text-stone-100">
            Let's start your training journey today.
          </p>
        </div>

        {/* Floating Stats Ribbon */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-16">
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {/* Skills Card */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-2">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">
                {USER_DATA.stats.skills}
              </div>
              <div className="text-xs md:text-sm text-stone-600 font-medium">
                Skills Mastered
              </div>
            </div>

            {/* Sessions Card */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-2">
                <Calendar className="w-8 h-8 md:w-10 md:h-10 text-stone-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">
                {USER_DATA.stats.sessions}
              </div>
              <div className="text-xs md:text-sm text-stone-600 font-medium">
                Sessions Completed
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-2">
                <Flame className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">
                {USER_DATA.stats.streak}
              </div>
              <div className="text-xs md:text-sm text-stone-600 font-medium">
                Day Streak
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {/* New Plan Card */}
              <a
                href="#"
                className="group bg-white rounded-xl shadow-sm p-6 border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
                    <Bot className="w-8 h-8 text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">New Plan</h3>
                  <p className="text-sm text-stone-600">Create a personalized training plan</p>
                </div>
              </a>

              {/* Ask Trainer Card */}
              <a
                href="#"
                className="group bg-white rounded-xl shadow-sm p-6 border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
                    <MessageCircle className="w-8 h-8 text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">Ask Trainer</h3>
                  <p className="text-sm text-stone-600">Get expert advice and guidance</p>
                </div>
              </a>

              {/* Log Session Card */}
              <a
                href="#"
                className="group bg-white rounded-xl shadow-sm p-6 border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
                    <FileText className="w-8 h-8 text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">Log Session</h3>
                  <p className="text-sm text-stone-600">Record your training session</p>
                </div>
              </a>

              {/* All Lessons Card */}
              <a
                href="#"
                className="group bg-white rounded-xl shadow-sm p-6 border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
                    <BookOpen className="w-8 h-8 text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">All Lessons</h3>
                  <p className="text-sm text-stone-600">Browse your training library</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trainer's Tip */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-serif font-semibold text-stone-900 mb-3 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Trainer's Tip
              </h3>
              <p className="text-stone-700 leading-relaxed italic">
                "{dailyTip}"
              </p>
            </div>

            {/* Up Next Widget */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-serif font-semibold text-stone-900 mb-4">Up Next</h3>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 text-sm">No upcoming sessions</p>
                <a href="#" className="inline-block mt-4 text-stone-900 font-medium text-sm hover:underline">
                  Schedule a session →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

