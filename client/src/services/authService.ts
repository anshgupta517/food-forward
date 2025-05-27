// client/src/services/authService.ts

const API_URL = 'http://localhost:5000/api/auth'; // Assuming server runs on port 5000

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'restaurant' | 'organization';
}

interface AuthResponse {
  token: string;
  user: User;
  message?: string; // For error messages from server
}

async function login(email_param: string, password_param: string): Promise<User> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email_param, password: password_param }),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  if (data.token && data.user) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } else {
    throw new Error('Login failed: No token or user data received.');
  }
}

async function register(name_param: string, email_param: string, password_param: string, userType_param: 'restaurant' | 'organization'): Promise<User> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: name_param, email: email_param, password: password_param, userType: userType_param }),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  
  // Registration in this app does not automatically log in the user or return a token.
  // It returns the user details without a password.
  // The user will have to log in after successful registration.
  if (data.user && data.user.id) { // Check if user object with id is returned
    return data.user;
  } else {
    // If API behavior changes to return token on register, handle here:
    // localStorage.setItem('token', data.token);
    // localStorage.setItem('user', JSON.stringify(data.user));
    // return data.user;
    throw new Error(data.message || 'Registration succeeded but no user data was returned as expected.');
  }
}

function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      localStorage.removeItem('user'); // Clear corrupted user data
      localStorage.removeItem('token'); // Also clear token as state is inconsistent
      return null;
    }
  }
  return null;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
};

// Helper to add auth token to headers for other API calls
export function getAuthHeaders(): Record<string, string> {
    const token = getToken();
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}
