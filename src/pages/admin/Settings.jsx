import React, { useState } from 'react';
import { Save, Shield, Video, Mic, Bell, Lock } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Settings() {
  const [settings, setSettings] = useState({
    webcamEnforcement: true,
    audioMonitoring: true,
    tabSwitchLimit: 3,
    browserLockdown: false,
    emailNotifications: true,
    autoSubmitOnTime: true
  });

  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@platform.com'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('Settings Saved Successfully!');
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('Profile Updated Successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Proctoring Settings */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Proctoring Rules</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2"><Video className="w-4 h-4 text-gray-500" /> Webcam Enforcement</h3>
                  <p className="text-sm text-gray-500 mt-1">Require candidates to keep webcam on during the entire exam.</p>
                </div>
                <button 
                  onClick={() => handleToggle('webcamEnforcement')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${settings.webcamEnforcement ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.webcamEnforcement ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2"><Mic className="w-4 h-4 text-gray-500" /> Audio Monitoring</h3>
                  <p className="text-sm text-gray-500 mt-1">Record and flag background noise thresholds.</p>
                </div>
                <button 
                  onClick={() => handleToggle('audioMonitoring')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${settings.audioMonitoring ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.audioMonitoring ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-2">Max Tab Switches Allowed</label>
                <input 
                  type="number" 
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={settings.tabSwitchLimit}
                  onChange={(e) => setSettings({...settings, tabSwitchLimit: parseInt(e.target.value)})}
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">Number of times a candidate can leave the exam tab before auto-submission.</p>
              </div>
            </div>
          </section>

          {/* Exam Experience */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Exam Experience</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto-Submit on Time Up</h3>
                  <p className="text-sm text-gray-500 mt-1">Automatically submit the exam when the timer reaches zero.</p>
                </div>
                <button 
                  onClick={() => handleToggle('autoSubmitOnTime')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${settings.autoSubmitOnTime ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.autoSubmitOnTime ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
                <Button onClick={handleSaveSettings} icon={<Save className="w-4 h-4" />}>Save System Settings</Button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Admin Profile */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-6">Admin Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <Input 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  required
                />
              </div>
              <div className="pt-4">
                <Button className="w-full justify-center">Update Profile</Button>
              </div>
            </form>
          </section>

          {/* Notifications */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-gray-900">Email Alerts</h3>
                <p className="text-xs text-gray-500 mt-1">Receive daily summaries</p>
              </div>
              <button 
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${settings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.emailNotifications ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
