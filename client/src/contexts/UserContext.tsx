"use client"
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import axiosInstance from '@/lib/axios';

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
}

export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  fetchUser: () => any;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axiosInstance.get('/user/profile');
        const userData = response.data;
        if (userData.dateOfBirth) {
          userData.dateOfBirth = new Date(userData.dateOfBirth).toISOString().split('T')[0]
        }
        setUser(userData);

        setIsLoading(false);
        return userData;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout();
      }
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const contextValue = useMemo(() => ({
    user,
    setUser,
    logout,
    fetchUser,
    isLoading
  }), [user, logout, fetchUser, isLoading]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};


