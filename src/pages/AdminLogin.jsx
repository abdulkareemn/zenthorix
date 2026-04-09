import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { KeyRound, ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!accessCode) {
      setError('Please enter the admin access code');
      return;
    }
    
    setIsLoading(true);
    try {
      await loginAdmin(accessCode);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid access code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl shadow-gray-200/50">
      <CardContent className="p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Control</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your secure access code to manage the platform.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Specific Access Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                type="password" 
                placeholder="Enter access code (e.g. ADMIN123)" 
                className="pl-10"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full h-11 text-base bg-gray-900 hover:bg-gray-800 focus:ring-gray-900" isLoading={isLoading}>
            Verify Code
          </Button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
          Return to{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
            Student Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLogin;
