import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService'; // Adjust path as necessary

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'restaurant' | 'organization';
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email_param: string, password_param: string) => Promise<User>;
  register: (name_param: string, email_param: string, password_param: string, userType_param: 'restaurant' | 'organization') => Promise<User>;
  logout: () => void;
  isLoading: boolean; // To handle loading state during auth operations
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to check localStorage

  useEffect(() => {
    // Check localStorage for existing token and user
    const storedToken = authService.getToken();
    const storedUser = authService.getCurrentUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(storedUser);
    }
    setIsLoading(false); // Finished initial load
  }, []);

  const login = async (email_param: string, password_param: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await authService.login(email_param, password_param);
      setCurrentUser(user);
      setToken(authService.getToken());
      setIsLoading(false);
      return user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (name_param: string, email_param: string, password_param: string, userType_param: 'restaurant' | 'organization'): Promise<User> => {
    setIsLoading(true);
    try {
      // authService.register in our setup doesn't log the user in or return a token.
      // It just creates the user.
      const user = await authService.register(name_param, email_param, password_param, userType_param);
      setIsLoading(false);
      // User will need to login separately after registration.
      return user; 
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setToken(null);
    // Optionally, redirect here or let the component using logout handle it.
    // Example: window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        token, 
        isAuthenticated: !!token && !!currentUser, 
        login, 
        register, 
        logout,
        isLoading 
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
