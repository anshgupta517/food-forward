import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Adjust path as necessary

const Navbar: React.FC = () => { // Renamed component to Navbar for convention
  const { isAuthenticated, logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="flex items-center justify-between px-5 bg-slate-800 h-20 w-full text-white fixed top-0 z-50">
      <Link to="/" className="text-3xl font-bold text-white">
        FoodForward
      </Link>
      <div className="flex items-center justify-center ">
        <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
          <Link to="/">Home</Link>
        </div>

        {isAuthenticated ? (
          <>
            <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
              <Link to="/profile">Profile ({currentUser?.name})</Link>
            </div>
            {currentUser?.userType === 'restaurant' && (
              <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
                <Link to="/my-listings">My Listings</Link>
              </div>
            )}
            {currentUser?.userType === 'organization' && (
              <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
                <Link to="/available-listings">Available Donations</Link>
              </div>
            )}
            <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
              <button onClick={handleLogout} className="bg-transparent border-none text-white">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
              <Link to="/login">Login</Link>
            </div>
            <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
              <Link to="/register">Register</Link>
            </div>
          </>
        )}
        
        {/* "Contact Us" can remain for all users or be conditional */}
        <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
          <Link to="/contact">Contact Us</Link> {/* Assuming a /contact route exists or will be added */}
        </div>
      </div>
    </div>
  );
};

export default Navbar; // Renamed export
