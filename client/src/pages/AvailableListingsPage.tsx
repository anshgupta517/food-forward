import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary
import { listingService, Listing } from '../services/listingService'; // Adjust path as necessary
import AvailableListingItem from '../components/AvailableListingItem'; // Adjust path as necessary
import Navbar from '../components/navbar'; // Adjust path as necessary

const AvailableListingsPage: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableListings = useCallback(async () => {
    if (currentUser?.userType === 'organization' && isAuthenticated) {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedListings = await listingService.getAvailableListings();
        setListings(fetchedListings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch available listings.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    if (!authLoading) { // Wait for auth state to be loaded
        fetchAvailableListings();
    }
  }, [fetchAvailableListings, authLoading]);

  const handleListingClaimed = (claimedListing: Listing) => {
    // Update the specific listing in the list to reflect its new status,
    // or remove it if the design is to hide claimed items immediately.
    // For now, let's update its status.
    setListings(prevListings =>
      prevListings.map(l => (l.id === claimedListing.id ? claimedListing : l))
    );
    // Could also filter out:
    // setListings(prevListings => prevListings.filter(l => l.id !== claimedListing.id));
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 flex justify-center items-center min-h-screen bg-gray-100">
          <p>Loading available donations...</p>
        </div>
      </>
    );
  }

  if (!isAuthenticated || currentUser?.userType !== 'organization') {
     // This should ideally be caught by ProtectedRoute, but as a fallback.
    return (
      <>
        <Navbar />
        <div className="pt-20 flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center">
          <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
          <p className="text-gray-700 mt-2">You must be logged in as an organization to view this page.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 min-h-screen bg-gray-50"> {/* Added pt-24 for fixed navbar */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-800">Available Food Donations</h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md shadow">{error}</div>}
          
          {listings.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="mt-2 text-xl font-semibold text-gray-700">No Donations Available Right Now</h2>
              <p className="mt-1 text-sm text-gray-500">
                Please check back later. New food donations are listed frequently.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <AvailableListingItem 
                key={listing.id} 
                listing={listing} 
                onListingClaimed={handleListingClaimed} 
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default AvailableListingsPage;
