import React, { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User, Camera, Mail, Phone, Upload } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Mock save
    setIsEditing(false);
    // In a real app, we would update the backend and the AuthContext here
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Avatar Card */}
        <Card className="md:col-span-1 border-0 shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-4">
              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border-4 border-white shadow-lg">
                <User size={64} className="opacity-50" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white mb-1" size={24} />
                <span className="text-xs text-white font-medium">Upload</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{formData.name}</h3>
            <p className="text-sm text-gray-500">{formData.email}</p>
            <div className="mt-6 w-full">
              <Button variant="outline" className="w-full gap-2 text-sm">
                <Upload size={16} /> Choose Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your details below.</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <Input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+1 (555) 000-0000"
                disabled={!isEditing} 
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter className="bg-gray-50 flex justify-end gap-3 rounded-b-xl border-t border-gray-100">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
