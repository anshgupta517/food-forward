import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary
import { listingService, Listing } from '../services/listingService'; // Adjust path as necessary
import CreateListingForm from '../components/CreateListingForm'; // Adjust path as necessary
import ListingItem from '../components/ListingItem'; // Adjust path as necessary
import Navbar from '../components/navbar'; // Adjust path as necessary

const MyListingsPage: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchListings = useCallback(async () => {
    if (currentUser?.userType === 'restaurant' && isAuthenticated) {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedListings = await listingService.getMyListings();
        setListings(fetchedListings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch listings.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    if (!authLoading) { // Wait for auth state to be loaded
        fetchListings();
    }
  }, [fetchListings, authLoading]);

  const handleListingCreated = () => {
    setShowCreateForm(false); // Hide form after creation
    fetchListings(); // Refresh the list
  };

  const handleListingDeleted = (listingId: string) => {
    setListings(prevListings => prevListings.filter(l => l.id !== listingId));
    // Optionally show a success message
  };
  
  const handleListingUpdated = (updatedListing: Listing) => {
    setListings(prevListings => 
      prevListings.map(l => (l.id === updatedListing.id ? updatedListing : l))
    );
     // Optionally show a success message
  };


  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 flex justify-center items-center min-h-screen bg-gray-100">
          <p>Loading listings...</p>
        </div>
      </>
    );
  }

  if (!isAuthenticated || currentUser?.userType !== 'restaurant') {
    return (
      <>
        <Navbar />
        <div className="pt-20 flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center">
          <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
          <p className="text-gray-700 mt-2">You must be logged in as a restaurant to view this page.</p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="pt-24 min-h-screen bg-gray-50"> {/* Added pt-24 for fixed navbar */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">My Food Listings</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
            >
              {showCreateForm ? 'Cancel' : '+ Add New Listing'}
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {showCreateForm && (
            <CreateListingForm 
                onListingCreated={handleListingCreated}
                onCancel={() => setShowCreateForm(false)} 
            />
          )}

          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md shadow">{error}</div>}
          
          {listings.length === 0 && !isLoading && !error && !showCreateForm && (
            <div className="text-center py-10">
              <p className="text-xl text-gray-500">You haven't created any listings yet.</p>
              <p className="text-gray-400 mt-2">Click the "+ Add New Listing" button to get started!</p>
            </div>
          )}

          <div className="mt-6 space-y-6">
            {listings.map(listing => (
              <ListingItem 
                key={listing.id} 
                listing={listing} 
                onListingDeleted={handleListingDeleted}
                onListingUpdated={handleListingUpdated} 
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default MyListingsPage;
