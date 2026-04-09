import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import ExamLayout from './layouts/ExamLayout';

// Public Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentResults from './pages/student/Results';
import ExamInstructions from './pages/student/ExamInstructions';
import ExamInterface from './pages/student/ExamInterface';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCandidates from './pages/admin/Candidates';
import AdminExams from './pages/admin/Exams';
import AdminProctoring from './pages/admin/Proctoring';
import AdminAlerts from './pages/admin/Alerts';
import AdminResults from './pages/admin/Results';
import AdminSettings from './pages/admin/Settings';

import { useAuth } from './utils/AuthContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login' }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on their role if they try to access unauthorized routes
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public / Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* Student Routes - Protected */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
               <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="results" element={<StudentResults />} />
        </Route>

        {/* Exam Routes (Student) - Protected */}
        <Route
          path="/student/exam"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
               <ExamLayout />
            </ProtectedRoute>
          }
        >
          <Route path=":examId/instructions" element={<ExamInstructions />} />
          <Route path=":examId/start" element={<ExamInterface />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']} redirectTo="/admin/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="candidates" element={<AdminCandidates />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="proctoring" element={<AdminProctoring />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
