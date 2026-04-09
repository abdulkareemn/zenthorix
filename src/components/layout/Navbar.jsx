import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Placeholder for mobile menu button if needed later */}
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Welcome, {user.name}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={18} />
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
