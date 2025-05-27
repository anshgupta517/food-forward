import React, { useState } from 'react';
import { Listing, listingService } from '../services/listingService'; // Adjust path
import { useAuth } from '../contexts/AuthContext'; // Adjust path

interface AvailableListingItemProps {
  listing: Listing;
  onListingClaimed: (claimedListing: Listing) => void; // Callback to update parent state
}

const AvailableListingItem: React.FC<AvailableListingItemProps> = ({ listing, onListingClaimed }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Determine if the current user can claim (is an organization and listing is available)
  const canClaim = currentUser?.userType === 'organization' && listing.status === 'available';

  const handleClaim = async () => {
    if (!canClaim) {
      setError("You cannot claim this listing or it's no longer available.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const claimedListing = await listingService.claimListing(listing.id);
      setSuccessMessage('Listing claimed successfully!');
      onListingClaimed(claimedListing); // Notify parent to update its list/UI
      // The button will become disabled or item might be removed by parent
    } catch (err: any) {
      setError(err.message || 'Failed to claim listing.');
      // If claim fails, the item might still be available, so button remains active
      // unless the error indicates it's no longer available (e.g. 409 Conflict)
      if (err.message && err.message.toLowerCase().includes('already claimed') || err.message.toLowerCase().includes('not available')) {
         // To ensure UI updates if another org claimed it nearly simultaneously.
         // Parent component should ideally refetch or update this item's status.
         // For now, we can pass a slightly modified listing object if the API doesn't return the updated one on error.
         onListingClaimed({...listing, status: 'claimed' }); // Optimistic update or based on error type
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => { // Clear messages after a few seconds
        setError(null);
        setSuccessMessage(null);
      }, 4000);
    }
  };

  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl ${listing.status !== 'available' ? 'opacity-70 bg-gray-100' : ''}`}>
      <h3 className={`text-xl font-semibold mb-2 ${listing.status === 'available' ? 'text-green-700' : 'text-gray-600'}`}>{listing.foodName}</h3>
      
      {error && <div className="my-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
      {successMessage && <div className="my-2 p-2 bg-green-100 text-green-700 rounded-md text-sm">{successMessage}</div>}

      <p className="text-gray-700 mb-1 text-sm"><span className="font-medium">Description:</span> {listing.description}</p>
      <p className="text-gray-700 mb-1 text-sm"><span className="font-medium">Quantity:</span> {listing.quantity}</p>
      <p className="text-gray-700 mb-1 text-sm"><span className="font-medium">Pickup At:</span> {listing.pickupLocation}</p>
      <p className="text-gray-700 mb-1 text-sm"><span className="font-medium">Expires On:</span> {new Date(listing.expiryDate).toLocaleDateString()}</p>
      <p className={`text-sm capitalize font-semibold mb-3 ${listing.status === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
        Status: {listing.status}
      </p>
      {/* Could display restaurantId or name if available/needed:
      <p className="text-gray-500 text-xs mb-1">Restaurant ID: {listing.restaurantId}</p> 
      */}
      
      {currentUser?.userType === 'organization' && (
        <button
          onClick={handleClaim}
          disabled={!canClaim || isLoading || listing.status !== 'available'}
          className={`mt-4 w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${!canClaim || listing.status !== 'available' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
            ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isLoading ? 'Claiming...' : (listing.status === 'available' ? 'Claim Listing' : `Already ${listing.status}`)}
        </button>
      )}
       {listing.status === 'claimed' && listing.organizationId === currentUser?.id && (
         <p className="mt-2 text-sm text-green-600 font-semibold">You claimed this item!</p>
      )}
    </div>
  );
};

export default AvailableListingItem;
