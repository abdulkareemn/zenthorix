import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10" />
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-primary rounded-xl p-3 flex items-center justify-center mb-4 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ProctorAI</h1>
          <p className="text-gray-500 mt-2">Secure Online Assessment Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
