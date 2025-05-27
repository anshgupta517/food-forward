import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext.tsx is in ../context

// Define an interface for the listing data
interface IListing {
  _id: string;
  foodItem: string;
  quantity: string;
  expiryDate: string; // Keep as string for display, format as needed
  status: 'available' | 'claimed' | 'expired';
  restaurant: { // Assuming restaurant details are populated
    _id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  claimedBy?: string; // User ID
  createdAt: string;
  updatedAt: string;
}

const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user role from AuthContext

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/listings'); // Fetches all available listings by default
      setListings(response.data);
      console.log('Listings fetched:', response.data);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.response?.data?.message || 'Failed to fetch listings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleClaim = async (listingId: string) => {
    if (!user || user.role !== 'organization') {
      alert('Only organizations can claim listings.');
      return;
    }
    try {
      const response = await api.put(`/listings/${listingId}/claim`);
      if (response.data) {
        alert('Listing claimed successfully!');
        // Update the specific listing in the local state or refetch all
        setListings(prevListings =>
          prevListings.map(listing =>
            listing._id === listingId ? { ...listing, status: 'claimed', claimedBy: user.id } : listing
          )
        );
        // Or simply call fetchListings() to refresh all data
        // fetchListings();
      }
    } catch (err: any) {
      console.error('Error claiming listing:', err);
      alert(err.response?.data?.message || 'Failed to claim listing.');
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading listings...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Available Food Listings</h1>
      {user?.role === 'restaurant' && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Link to="/create-listing" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            + Create New Listing
          </Link>
        </div>
      )}
      {listings.length === 0 && !isLoading && (
        <p style={{ textAlign: 'center' }}>No available listings at the moment.</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {listings.map((listing) => (
          <div key={listing._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: '0', color: '#333' }}>{listing.foodItem}</h3>
            <p><strong>Quantity:</strong> {listing.quantity}</p>
            <p><strong>Expires:</strong> {new Date(listing.expiryDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style={{ color: listing.status === 'available' ? 'green' : 'orange' }}>{listing.status.toUpperCase()}</span></p>
            <hr style={{ margin: '10px 0' }} />
            <p><strong>Restaurant:</strong> {listing.restaurant.name}</p>
            {listing.restaurant.address && <p><strong>Address:</strong> {listing.restaurant.address}</p>}
            {listing.restaurant.phone && <p><strong>Phone:</strong> {listing.restaurant.phone}</p>}
            {listing.restaurant.email && <p><strong>Email:</strong> {listing.restaurant.email}</p>}
            {user?.role === 'organization' && listing.status === 'available' && (
              <button
                onClick={() => handleClaim(listing._id)}
                style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Claim Listing
              </button>
            )}
             {listing.status === 'claimed' && listing.claimedBy === user?.id && (
                <p style={{ color: 'blue', marginTop: '10px' }}>You claimed this listing.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsPage;
