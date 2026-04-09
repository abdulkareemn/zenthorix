import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, AlertTriangle, ChevronLeft } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();

  // Mock Result Data
  const score = 85; 
  const isShortlisted = score >= 75;

  const resultBreakdown = [
    { name: 'Coding Assessments', max: 50, scored: 45 },
    { name: 'Behavioral Questions', max: 30, scored: 25 },
    { name: 'Multiple Choice', max: 20, scored: 15 },
  ];

  const questionWise = [
    { id: 1, title: 'Two Sum variant', status: 'Correct', time: '12m 30s' },
    { id: 2, title: 'Binary Tree Inversion', status: 'Correct', time: '18m 10s' },
    { id: 3, title: 'Dynamic Programming Array', status: 'Partial', time: '25m 00s' },
    { id: 4, title: 'Graph Traversal', status: 'Incorrect', time: '15m 45s' },
    { id: 5, title: 'System Design Basics', status: 'Correct', time: '8m 20s' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       
      <div className="flex items-center gap-4 mb-4 text-gray-500 hover:text-gray-900 cursor-pointer w-fit" onClick={() => navigate('/dashboard')}>
        <ChevronLeft size={20} /> Back to Dashboard
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Summary Card */}
        <Card className="lg:col-span-1 border-0 shadow-lg text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-indigo-400"></div>
          <CardContent className="p-8 flex flex-col items-center">
            <Trophy className={`h-16 w-16 mb-4 ${isShortlisted ? 'text-yellow-400' : 'text-gray-400'}`} />
            <h2 className="text-xl font-semibold text-gray-900">Total Score</h2>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-6xl font-black text-gray-900 tracking-tighter">{score}</span>
              <span className="text-xl text-gray-500 font-medium">/ 100</span>
            </div>

            <div className={`mt-6 px-6 py-2 rounded-full font-bold text-sm border flex items-center gap-2 ${
                isShortlisted 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
              {isShortlisted ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
              {isShortlisted ? 'Shortlisted' : 'Not Shortlisted'}
            </div>
            
            <p className="text-sm text-gray-500 mt-6 leading-relaxed">
              {isShortlisted 
                ? "Congratulations! You have passed the assessment. HR will contact you soon." 
                : "Unfortunately, you did not meet the required threshold for this role."}
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Breakdown */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Breakdown</h3>
              <div className="space-y-5">
                {resultBreakdown.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-900">{item.scored} / {item.max}</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${(item.scored / item.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question-wise Results Table */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-0 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Question-wise Result</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Q No.</th>
                      <th className="px-6 py-4">Topic</th>
                      <th className="px-6 py-4">Time Taken</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionWise.map((q) => (
                      <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">0{q.id}</td>
                        <td className="px-6 py-4 text-gray-700">{q.title}</td>
                        <td className="px-6 py-4 text-gray-500">{q.time}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                            ${q.status === 'Correct' ? 'bg-green-100 text-green-700' :
                              q.status === 'Incorrect' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'}`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results;
