import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const stats = [
    { title: 'Total Exams', value: '12', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Completed', value: '8', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pending', value: '4', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const upcomingExams = [
    { id: '1', title: 'Senior Frontend Developer Assessment', date: 'Oct 24, 2026', duration: '90 mins', status: 'Available' },
    { id: '2', title: 'React Performance Optimization', date: 'Oct 26, 2026', duration: '60 mins', status: 'Upcoming' },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Candidate'}. Here's your assessment overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upcoming Exams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">upcoming Exams</h2>
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View all <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingExams.map((exam) => (
              <Card key={exam.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                        {exam.status === 'Available' && (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Available Now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {exam.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {exam.duration}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => navigate(`/student/exam/${exam.id}/instructions`)}
                      disabled={exam.status !== 'Available'}
                      variant={exam.status === 'Available' ? 'primary' : 'outline'}
                    >
                      {exam.status === 'Available' ? 'Start Assessment' : 'Starts Soon'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Card>
            <CardContent className="p-5">
              <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-2">
                {[
                  { title: 'Passed UI/UX Basics', time: '2 days ago', badge: 'bg-green-500' },
                  { title: 'Completed Profile Setup', time: '1 week ago', badge: 'bg-primary' },
                  { title: 'Account Created', time: '1 week ago', badge: 'bg-gray-400' },
                ].map((item, i) => (
                  <div key={i} className="relative pl-6">
                    <span className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full ${item.badge} ring-4 ring-white`} />
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
