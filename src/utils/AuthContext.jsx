import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('exam_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = { email: 'student@example.com', userName: 'Google Student', role: 'Student', id: 'u123' };
        localStorage.setItem('exam_user', JSON.stringify(userData));
        setUser(userData);
        resolve(userData);
      }, 1000);
    });
  };

  const loginAdmin = async (accessCode) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (accessCode === 'ADMIN123') {
          const userData = { email: 'admin@platform.com', userName: 'Admin User', role: 'Admin', id: 'a999' };
          localStorage.setItem('exam_user', JSON.stringify(userData));
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error("Invalid Admin Access Code"));
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('exam_user');
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loginWithGoogle,
    loginAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
