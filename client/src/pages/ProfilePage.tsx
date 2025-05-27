import React, { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // To access current user and potentially update context

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'restaurant' | 'organization';
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Form states for editing
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  // Password change is optional and can be complex, so skipping for now
  // const [password, setPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');

  const { user: authUser, login: updateAuthContextUser } = useAuth(); // Get user from auth context to re-fetch or update

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<UserProfile>('/users/me');
        setProfile(response.data);
        // Initialize form states when profile data is fetched
        setName(response.data.name);
        setAddress(response.data.address || '');
        setPhone(response.data.phone || '');
        console.log('Profile fetched:', response.data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile.');
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) { // Ensure authUser is available before fetching
        fetchProfile();
    } else {
        setIsLoading(false);
        setError("Not authenticated."); // Should be handled by ProtectedRoute mostly
    }
  }, [authUser]); // Re-fetch if authUser changes (e.g. after a token refresh not handled by this page)

  const handleEditToggle = () => {
    if (!isEditMode && profile) {
      // Entering edit mode, ensure form fields are current
      setName(profile.name);
      setAddress(profile.address || '');
      setPhone(profile.phone || '');
    }
    setIsEditMode(!isEditMode);
    setError(null); // Clear previous errors when toggling mode
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const updatedData = {
      name,
      address: address || undefined, // Send undefined if empty, so it might be cleared based on backend logic
      phone: phone || undefined,
    };

    try {
      const response = await api.put<UserProfile>('/users/me', updatedData);
      setProfile(response.data); // Update local profile state with response from server
      setIsEditMode(false);
      alert('Profile updated successfully!');

      // Optionally, refresh the AuthContext's user state if it stores more than id/role
      // This requires the login function in AuthContext to be able to re-fetch user or accept new user data
      // A simple way is to re-trigger the token verification logic or a dedicated user refresh function
      // For now, we assume the name in the navbar will update if AuthContext's user.name is updated.
      // A robust way:
      if (response.data.token) { // If the update endpoint returns a new token (it usually doesn't for /users/me)
        updateAuthContextUser(response.data.token);
      } else {
        // If no new token, but user data changed, we might need a way to tell AuthContext to refresh user
        // This can be done by calling a function like `refreshUser()` if exposed by AuthContext
        // or by re-calling the login function if it's designed to fetch user data.
        // For now, let's assume the name change is the main visible thing from AuthContext
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            updateAuthContextUser(currentToken); // This should re-fetch user data in AuthContext
        }
      }


    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading profile...</div>;
  if (error && !profile) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Error: {error}</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '20px' }}>No profile data available.</div>;


  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>User Profile</h1>
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

      {!isEditMode ? (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
          <p><strong>Address:</strong> {profile.address || 'Not provided'}</p>
          <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
          <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
          <button onClick={handleEditToggle} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSaveChanges}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email_display" style={{ display: 'block', marginBottom: '5px' }}>Email (cannot change):</label>
            <input
              type="email"
              id="email_display"
              value={profile.email}
              disabled
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
            />
          </div>
           <div style={{ marginBottom: '15px' }}>
            <label htmlFor="role_display" style={{ display: 'block', marginBottom: '5px' }}>Role (cannot change):</label>
            <input
              type="text"
              id="role_display"
              value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              disabled
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Enter your address"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Enter your phone number"
            />
          </div>
          {/* Password change fields would go here if implemented */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1 }}>
              Save Changes
            </button>
            <button type="button" onClick={handleEditToggle} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
