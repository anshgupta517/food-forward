import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Assuming AuthContext.tsx is in ./context
import Home from './pages/home'; // Assuming home.tsx is in ./pages
import Login from './pages/login'; // Assuming login.tsx is in ./pages
import Register from './pages/register'; // Assuming register.tsx is in ./pages
import Listings from './pages/ListingsPage'; // Updated import
import Profile from './pages/ProfilePage'; // Updated import
import CreateListingPage from './pages/CreateListingPage'; // Import for Create Listing Page
// A simple Navbar component for now, can be moved to components later
const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      {!isAuthenticated ? (
        <>
          <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
          <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
        </>
      ) : (
        <>
          <Link to="/listings" style={{ marginRight: '10px' }}>Listings</Link>
          <Link to="/profile" style={{ marginRight: '10px' }}>Profile ({user?.name})</Link>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </nav>
  );
};

// Placeholder for pages that might not exist yet to avoid import errors
// We already have Home, Login, Register, Listings, Profile from the ls output.
// const Listings: React.FC = () => <div>Listings Page (Protected)</div>;
// const Profile: React.FC = () => <div>Profile Page (Protected)</div>;

// ProtectedRoute component (basic example)
const ProtectedRoute: React.FC<{ children: JSX.Element; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    // Consider using <Navigate to="/login" replace /> from react-router-dom for better UX
    return <Login />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // If roles are specified and the user doesn't have one of them, show unauthorized message
    // It's good practice to have a dedicated "Unauthorized" page or component
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Unauthorized Access</h2>
        <p>You do not have the necessary permissions to view this page.</p>
        <Link to="/">Go to Homepage</Link>
      </div>
    );
  }

  // If authenticated and (no roles specified OR user has the required role)
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/listings" 
              element={
                <ProtectedRoute>
                  <Listings />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-listing"
              element={
                <ProtectedRoute roles={['restaurant']}>
                  <CreateListingPage />
                </ProtectedRoute>
              }
            />
            {/* Add other routes here */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
