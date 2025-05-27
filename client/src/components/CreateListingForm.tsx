import React, { useState } from 'react';
import { listingService, ListingData } from '../services/listingService'; // Adjust path as necessary
import { useAuth } from '../contexts/AuthContext'; // To ensure only restaurants can see/use it if not handled by parent

interface CreateListingFormProps {
  onListingCreated: () => void; // Callback to refresh listings on parent page
  onCancel?: () => void; // Optional: Callback to hide the form
}

const CreateListingForm: React.FC<CreateListingFormProps> = ({ onListingCreated, onCancel }) => {
  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | string>(''); // Allow string for input flexibility
  const [pickupLocation, setPickupLocation] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  if (currentUser?.userType !== 'restaurant') {
    // This form should ideally not even be rendered for non-restaurants.
    // This is a fallback.
    return <p>You are not authorized to create listings.</p>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!foodName || !description || quantity === '' || !pickupLocation || !expiryDate) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    const parsedQuantity = parseInt(quantity as string, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be a positive number.");
      setIsLoading(false);
      return;
    }

    const listingData: ListingData = {
      foodName,
      description,
      quantity: parsedQuantity,
      pickupLocation,
      expiryDate, // Ensure this is in ISO 8601 format if necessary, or handle conversion
    };

    try {
      await listingService.createListing(listingData);
      setSuccessMessage('Listing created successfully!');
      // Clear form
      setFoodName('');
      setDescription('');
      setQuantity('');
      setPickupLocation('');
      setExpiryDate('');
      onListingCreated(); // Trigger refresh or other actions in parent
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3s
    } catch (err: any) {
      setError(err.message || 'Failed to create listing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-6 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Food Listing</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="foodName" className="block text-sm font-medium text-gray-700">Food Name</label>
          <input
            type="text"
            id="foodName"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">Pickup Location</label>
          <input
            type="text"
            id="pickupLocation"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input
            type="date" // HTML5 date picker provides YYYY-MM-DD
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Listing'}
          </button>
          {onCancel && (
             <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateListingForm;
