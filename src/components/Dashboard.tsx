import React from 'react';
import { FileText, Users, Briefcase, MessageSquare, TrendingUp, Clock, Star } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { StatCardSkeleton, CardSkeleton } from './SkeletonLoader';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Projects', value: '12', icon: Briefcase, color: 'from-lavender-500 to-purple-600', change: '+2 this month' },
    { label: 'Skills Listed', value: '8', icon: FileText, color: 'from-emerald-500 to-teal-600', change: '+1 this week' },
    { label: 'Certificates', value: '5', icon: Star, color: 'from-amber-500 to-orange-600', change: 'Up to date' },
    { label: 'Messages', value: '23', icon: MessageSquare, color: 'from-rose-500 to-pink-600', change: '+5 unread' },
  ];

  const recentActivities = [
    { action: 'Updated About Me section', time: '2 hours ago', type: 'edit' },
    { action: 'Added new project: E-Commerce Platform', time: '1 day ago', type: 'create' },
    { action: 'Received message from John Smith', time: '2 days ago', type: 'message' },
    { action: 'Updated React skill proficiency', time: '3 days ago', type: 'edit' },
  ];

  if (!isLoaded || loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-96"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-lavender-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">
              Welcome back, <span className="bg-gradient-to-r from-lavender-400 to-purple-400 bg-clip-text text-transparent">{user?.firstName || 'User'}</span>
            </h2>
            <p className="text-slate-400 mt-1">Here's what's happening with your portfolio today</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-slate-600">
              <div className="flex items-center">
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-lavender-400" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'create' ? 'bg-green-500' : 
                  activity.type === 'edit' ? 'bg-lavender-500' : 'bg-orange-500'
                }`}></div>
                <div className="flex-1">
                  <span className="text-slate-200 text-sm">{activity.action}</span>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-lavender-400" />
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-gradient-to-r from-lavender-500 to-purple-600 hover:from-lavender-600 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-white" />
                <div>
                  <span className="font-medium text-white block">Update Resume</span>
                  <span className="text-xs text-lavender-100">Upload your latest resume</span>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-white" />
                <div>
                  <span className="font-medium text-white block">Add New Project</span>
                  <span className="text-xs text-emerald-100">Showcase your latest work</span>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-white" />
                <div>
                  <span className="font-medium text-white block">Check Messages</span>
                  <span className="text-xs text-amber-100">5 unread messages</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}