import React, { useState } from 'react';
import { AlertCircle, EyeOff, Mic, LayoutDashboard, Search, Filter } from 'lucide-react';
import Input from '../../components/ui/Input';

const mockAlerts = [
  { id: 1, name: 'Samantha Lee', type: 'No Face', time: '10:42 AM', severity: 'high', icon: <EyeOff className="w-5 h-5" /> },
  { id: 2, name: 'Michael Chen', type: 'High Noise', time: '10:38 AM', severity: 'medium', icon: <Mic className="w-5 h-5" /> },
  { id: 3, name: 'Samantha Lee', type: 'Tab Switch', time: '10:35 AM', severity: 'high', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 4, name: 'Alex Johnson', type: 'High Noise', time: '10:15 AM', severity: 'low', icon: <Mic className="w-5 h-5" /> },
  { id: 5, name: 'Rachel Green', type: 'No Face', time: '09:50 AM', severity: 'high', icon: <EyeOff className="w-5 h-5" /> },
  { id: 6, name: 'David Smith', type: 'Tab Switch', time: '09:45 AM', severity: 'medium', icon: <LayoutDashboard className="w-5 h-5" /> },
];

export default function Alerts() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = mockAlerts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || a.severity === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="w-full sm:max-w-xs relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search by candidate..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <ul className="divide-y divide-gray-100">
          {filteredAlerts.map(alert => (
            <li key={alert.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full flex-shrink-0
                  ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : ''}
                  ${alert.severity === 'medium' ? 'bg-amber-100 text-amber-600' : ''}
                  ${alert.severity === 'low' ? 'bg-yellow-100 text-yellow-600' : ''}
                `}>
                  {alert.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{alert.name}</p>
                  <p className="text-sm text-gray-500">Violation: {alert.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{alert.time}</span>
                <button className="text-indigo-600 hover:text-indigo-800 font-medium">Review</button>
              </div>
            </li>
          ))}
          {filteredAlerts.length === 0 && (
            <li className="p-8 text-center text-gray-500 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
              <p>No alerts match your search.</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
