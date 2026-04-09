import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { LayoutDashboard, Users, FileText, Video, Bell, Award, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Candidates', icon: Users, path: '/admin/candidates' },
    { name: 'Exams', icon: FileText, path: '/admin/exams' },
    { name: 'Live Proctoring', icon: Video, path: '/admin/proctoring' },
    { name: 'Alerts', icon: Bell, path: '/admin/alerts' },
    { name: 'Results', icon: Award, path: '/admin/results' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 shrink-0 hidden lg:flex flex-col text-white">
         <div className="h-16 flex items-center px-6 border-b border-gray-800">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 font-bold text-white shadow-lg shadow-primary/30">
               EX
           </div>
           <span className="text-lg font-bold tracking-tight">Admin Control</span>
         </div>
         <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
           <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Menu</div>
           {navItems.map((item) => (
             <NavLink
               key={item.name}
               to={item.path}
               className={({ isActive }) =>
                 \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \${
                   isActive 
                     ? 'bg-primary/10 text-primary' 
                     : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                 }\`
               }
             >
               <item.icon size={18} />
               {item.name}
             </NavLink>
           ))}
         </nav>
         <div className="p-4 border-t border-gray-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
            >
              <LogOut size={18} />
              Sign Out
            </button>
         </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
           <h2 className="text-lg font-semibold text-gray-800">Command Center</h2>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                   {user?.userName?.[0]?.toUpperCase() || 'A'}
                 </div>
                 <div className="hidden sm:block">
                   <p className="text-sm font-medium text-gray-700 leading-none">{user?.userName || 'Admin'}</p>
                   <p className="text-xs text-gray-500 mt-1">Platform Admin</p>
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
