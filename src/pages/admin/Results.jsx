import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const mockResults = [
  { id: 1, name: 'Alex Johnson', language: 'Java', coding: 95, behavior: 90, total: 92.5, status: 'Shortlisted' },
  { id: 2, name: 'Samantha Lee', language: 'Python', coding: 80, behavior: 60, total: 70, status: 'Rejected' },
  { id: 3, name: 'Michael Chen', language: 'C++', coding: 88, behavior: 85, total: 86.5, status: 'Shortlisted' },
  { id: 4, name: 'Emily Davis', language: 'Python', coding: 92, behavior: 95, total: 93.5, status: 'Shortlisted' },
  { id: 5, name: 'David Smith', language: 'C', coding: 45, behavior: 80, total: 62.5, status: 'Rejected' },
  { id: 6, name: 'Rachel Green', language: 'Java', coding: 75, behavior: 70, total: 72.5, status: 'Pending' },
];

export default function Results() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResults = mockResults.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        <Button variant="primary">Export to CSV</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="w-full sm:max-w-xs relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search candidate name..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100">Candidate <ChevronDown className="w-4 h-4 inline" /></th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100">Language <ChevronDown className="w-4 h-4 inline" /></th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-center">Coding Score <ChevronDown className="w-4 h-4 inline" /></th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-center">Behavior Score <ChevronDown className="w-4 h-4 inline" /></th>
                <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-center">Total <ChevronDown className="w-4 h-4 inline" /></th>
                <th scope="col" className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{result.name}</td>
                  <td className="px-6 py-4">{result.language}</td>
                  <td className="px-6 py-4 text-center font-mono">{result.coding}%</td>
                  <td className="px-6 py-4 text-center font-mono">{result.behavior}%</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-gray-700">{result.total}%</td>
                  <td className="px-6 py-4 text-center">
                    {result.status === 'Shortlisted' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Shortlisted</span>}
                    {result.status === 'Rejected' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rejected</span>}
                    {result.status === 'Pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
