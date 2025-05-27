import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api'; // Assuming api.ts is in ../services

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'restaurant' | 'organization'>('restaurant'); // Default role
  const [address, setAddress] = useState(''); // Optional
  const [phone, setPhone] = useState(''); // Optional
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!name || !email || !password || !role) {
      setError('Name, email, password, and role are required.');
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        address, // Include optional fields
        phone,   // Include optional fields
      });

      if (response.data.token) {
        setAuthToken(response.data.token);
        // Redirect to login page after successful registration
        // Later, this could be a protected route or dashboard
        navigate('/login');
        console.log('Registration successful, token set, redirected to login.');
      } else {
        setError('Registration failed: No token received.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'restaurant' | 'organization')}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          >
            <option value="restaurant">Restaurant</option>
            <option value="organization">Organization</option>
          </select>
        </div>
         <div style={{ marginBottom: '15px' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>Address (Optional):</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>Phone (Optional):</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <a href="/login" style={{ color: '#007bff' }}>Login here</a>
      </p>
    </div>
  );
};

export default Register;
