import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // Ensure your server's API base URL is correct
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the JWT in localStorage and Axios headers
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set in localStorage and Axios headers.');
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    console.log('Token removed from localStorage and Axios headers.');
  }
};

// Function to remove the JWT (effectively the same as setAuthToken(null))
export const removeAuthToken = () => {
  setAuthToken(null);
};

// Interceptor to automatically set the token from localStorage if available
// This is useful if the page reloads and the Axios instance is re-created
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

export default api;
