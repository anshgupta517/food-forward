import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css"; // Keep global styles
import Navbar from "./components/navbar"; // Import Navbar
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile"; // Import Profile page
import Contact from "./pages/contact"; // Import Contact page
import MyListingsPage from "./pages/MyListingsPage"; // Import MyListingsPage
import AvailableListingsPage from "./pages/AvailableListingsPage"; // Import AvailableListingsPage
// import Listings from "./pages/listings"; // Uncomment if/when created

function App() {
  return (
    <BrowserRouter>
      {/* Navbar is placed outside Routes to be present on all pages */}
      {/* <Navbar /> */} 
      {/* The Navbar component itself likely includes its own Navbar, 
          so it might not be needed here if pages include it. 
          If pages do NOT include Navbar, then this is the place.
          Based on profile.tsx and contact.tsx, they include Navbar.
          So, it's better to let pages manage their Navbar if they need it, or have a Layout component.
          For now, I'll remove it from here assuming pages include it or will.
          If not, the Navbar in profile.tsx and contact.tsx would be duplicated by this one.
      */}
      <div className="app-content"> {/* Optional: for global layout styling if needed */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} /> 
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/my-listings" element={
            <ProtectedRoute role="restaurant">
              <MyListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/available-listings" element={
            <ProtectedRoute role="organization">
              <AvailableListingsPage />
            </ProtectedRoute>
          } />
          
          {/* Example of another protected route if listings page is for auth users only */}
          {/* <Route path="/listings/:id" element={
            <ProtectedRoute>
              <Listings />
            </ProtectedRoute>
          } /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
