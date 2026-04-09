import React, { useState } from 'react';
import { Search, Filter, Eye, Flag, Trash2, MoreVertical } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const mockCandidates = [
  { id: 1, name: 'Alex Johnson', email: 'alex.j@example.com', language: 'Java', score: 92, status: 'Shortlisted' },
  { id: 2, name: 'Samantha Lee', email: 'sam.lee@example.com', language: 'Python', score: 88, status: 'Pending' },
  { id: 3, name: 'Michael Chen', email: 'm.chen@example.com', language: 'C++', score: 45, status: 'Rejected' },
  { id: 4, name: 'Emily Davis', email: 'edavis@example.com', language: 'Python', score: 95, status: 'Shortlisted' },
  { id: 5, name: 'David Smith', email: 'd.smith@example.com', language: 'C', score: 72, status: 'Pending' },
];

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCandidates = mockCandidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
        <Button variant="primary">Export List</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="w-full sm:max-w-xs relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search candidates..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">Candidate</th>
                <th scope="col" className="px-6 py-3">Selected Language</th>
                <th scope="col" className="px-6 py-3">Score</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div>
                      <div className="font-semibold">{candidate.name}</div>
                      <div className="text-gray-400 text-xs">{candidate.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{candidate.language}</td>
                  <td className="px-6 py-4 font-semibold">{candidate.score}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${candidate.status === 'Shortlisted' ? 'bg-green-100 text-green-700' : ''}
                      ${candidate.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${candidate.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-gray-400">
                      <button className="hover:text-indigo-600 transition-colors p-1" title="View details"><Eye className="w-5 h-5" /></button>
                      <button className="hover:text-amber-500 transition-colors p-1" title="Flag candidate"><Flag className="w-5 h-5" /></button>
                      <button className="hover:text-red-600 transition-colors p-1" title="Remove"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCandidates.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No candidates found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
