import React, { useState } from 'react';
import { Listing, ListingData, listingService } from '../services/listingService'; // Adjust path

interface ListingItemProps {
  listing: Listing;
  onListingDeleted: (listingId: string) => void;
  onListingUpdated: (updatedListing: Listing) => void;
}

const ListingItem: React.FC<ListingItemProps> = ({ listing, onListingDeleted, onListingUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ListingData>>({
    foodName: listing.foodName,
    description: listing.description,
    quantity: listing.quantity,
    pickupLocation: listing.pickupLocation,
    expiryDate: listing.expiryDate.split('T')[0], // Format for date input 'YYYY-MM-DD'
    status: listing.status,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      setIsLoading(true);
      setError(null);
      try {
        await listingService.deleteListing(listing.id);
        onListingDeleted(listing.id);
        // No need to set success message as item will disappear
      } catch (err: any) {
        setError(err.message || 'Failed to delete listing.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value, 10) || '' : value }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Ensure quantity is a number before sending
      const dataToUpdate: Partial<ListingData> = {
        ...editData,
        quantity: Number(editData.quantity)
      };

      if (isNaN(dataToUpdate.quantity as number) || (dataToUpdate.quantity as number) <=0) {
          setError("Quantity must be a positive number.");
          setIsLoading(false);
          return;
      }

      const updatedListing = await listingService.updateListing(listing.id, dataToUpdate);
      onListingUpdated(updatedListing);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update listing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6 transition-shadow duration-300 hover:shadow-xl">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor={`foodName-${listing.id}`} className="block text-sm font-medium text-gray-700">Food Name</label>
            <input
              type="text"
              id={`foodName-${listing.id}`}
              name="foodName"
              value={editData.foodName || ''}
              onChange={handleEditChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor={`description-${listing.id}`} className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id={`description-${listing.id}`}
              name="description"
              value={editData.description || ''}
              onChange={handleEditChange}
              rows={3}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor={`quantity-${listing.id}`} className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id={`quantity-${listing.id}`}
              name="quantity"
              value={editData.quantity || ''}
              onChange={handleEditChange}
              min="1"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor={`pickupLocation-${listing.id}`} className="block text-sm font-medium text-gray-700">Pickup Location</label>
            <input
              type="text"
              id={`pickupLocation-${listing.id}`}
              name="pickupLocation"
              value={editData.pickupLocation || ''}
              onChange={handleEditChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor={`expiryDate-${listing.id}`} className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              id={`expiryDate-${listing.id}`}
              name="expiryDate"
              value={editData.expiryDate || ''}
              onChange={handleEditChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
           <div>
            <label htmlFor={`status-${listing.id}`} className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id={`status-${listing.id}`}
              name="status"
              value={editData.status || 'available'}
              onChange={handleEditChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="reserved">Reserved</option>
              {/* Add other statuses if applicable */}
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} disabled={isLoading} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-indigo-700 mb-2">{listing.foodName}</h3>
          <p className="text-gray-600 mb-1"><span className="font-medium">Description:</span> {listing.description}</p>
          <p className="text-gray-600 mb-1"><span className="font-medium">Quantity:</span> {listing.quantity}</p>
          <p className="text-gray-600 mb-1"><span className="font-medium">Pickup At:</span> {listing.pickupLocation}</p>
          <p className="text-gray-600 mb-1"><span className="font-medium">Expires On:</span> {new Date(listing.expiryDate).toLocaleDateString()}</p>
          <p className={`text-gray-600 mb-3 capitalize font-medium ${listing.status === 'available' ? 'text-green-600' : 'text-yellow-600'}`}>
            <span className="font-medium text-gray-600">Status:</span> {listing.status}
            {listing.status === 'claimed' && listing.organizationId && <span className="text-sm text-gray-500"> (Org ID: {listing.organizationId})</span>}
          </p>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListingItem;
