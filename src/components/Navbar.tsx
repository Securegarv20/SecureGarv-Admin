import React from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Bell } from 'lucide-react';

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-lavender-400 to-purple-400 bg-clip-text text-transparent">
            SecureGarv Admin
          </h1>
          {user && (
            <div className="hidden md:block">
              {/* <p className="text-slate-300 text-sm">
                Welcome back, <span className="text-lavender-400 font-medium">{user.firstName}</span>
              </p> */}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-400 hover:text-lavender-400 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-slate-800 border-slate-700",
                  userButtonPopoverActionButton: "text-slate-300 hover:bg-slate-700"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}