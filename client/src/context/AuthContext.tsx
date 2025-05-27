import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAuthToken, removeAuthToken } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; role: string; name: string; email: string } | null; // Basic user info
  token: string | null;
  isLoading: boolean; // To handle async operations like checking token on load
  login: (token: string) => Promise<void>;
  logout: () => void;
  // register function might not be needed here if pages handle it directly
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string; role: string; name: string; email: string } | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setAuthToken(storedToken); // Set token for api calls
        try {
          // Optionally, you can decode the token here to get basic user info like role if it's included
          // For a more robust solution, you'd have an endpoint like /auth/me or /users/me
          // For now, we'll assume login function will fetch user details
          // Let's try to fetch user profile if token exists
          const response = await api.get('/users/me'); // Assumes /users/me endpoint exists
          if (response.data) {
            setUser({
              id: response.data._id, // Assuming MongoDB _id
              role: response.data.role,
              name: response.data.name,
              email: response.data.email,
            });
            setIsAuthenticated(true);
            setTokenState(storedToken);
            console.log('User verified from token, AuthContext updated.');
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Token verification failed or /users/me failed:', error);
          removeAuthToken(); // Clear invalid token
          setIsAuthenticated(false);
          setUser(null);
          setTokenState(null);
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (newToken: string) => {
    setIsLoading(true);
    setAuthToken(newToken);
    try {
      // Fetch user profile after login to get user details
      const response = await api.get('/users/me');
      if (response.data) {
         setUser({
            id: response.data._id,
            role: response.data.role,
            name: response.data.name,
            email: response.data.email,
          });
        setIsAuthenticated(true);
        setTokenState(newToken);
        console.log('Login successful, AuthContext updated.');
      } else {
        throw new Error('Failed to fetch user profile after login');
      }
    } catch (error) {
      console.error('Login process error (fetching user):', error);
      removeAuthToken(); // Clean up if fetching user fails
      setIsAuthenticated(false);
      setUser(null);
      setTokenState(null);
    }
    setIsLoading(false);
  };

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    setTokenState(null);
    console.log('Logout successful, AuthContext cleared.');
    // Optionally, redirect to home or login page via useNavigate if used here or in component calling logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, login, logout }}>
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
