import { authService, getAuthHeaders } from './authService'; // Assuming getAuthHeaders is exported from authService

const API_BASE_URL = 'http://localhost:5000/api/listings'; // Adjust if your server URL is different

interface ListingData {
  foodName: string;
  description: string;
  quantity: number;
  pickupLocation: string;
  expiryDate: string; // ISO 8601 date string
  status?: string; // Optional, defaults to 'available' on backend
}

interface Listing extends ListingData {
  id: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  claimedAt?: string;
}

interface ServerError {
  message: string;
}

// Helper to handle common response logic
async function handleResponse<T>(response: Response): Promise<T> {
  const data: T | ServerError = await response.json();

  if (!response.ok) {
    const errorMessage = (data as ServerError).message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return data as T;
}

async function createListing(listingData: ListingData): Promise<Listing> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Add auth token to headers
    },
    body: JSON.stringify(listingData),
  });
  return handleResponse<Listing>(response);
}

async function getMyListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/my-listings`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<Listing[]>(response);
}

async function updateListing(listingId: string, updateData: Partial<ListingData>): Promise<Listing> {
  const response = await fetch(`${API_BASE_URL}/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updateData),
  });
  return handleResponse<Listing>(response);
}

async function deleteListing(listingId: string): Promise<{ message?: string }> { // Backend returns 204 No Content or error
  const response = await fetch(`${API_BASE_URL}/${listingId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
   if (!response.ok) {
    const data: ServerError = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) {
    return { message: 'Listing deleted successfully' }; // Or simply return void/true
  }
  return handleResponse<{ message?: string }>(response); // Should handle other cases if API changes
}

async function getAvailableListings(): Promise<Listing[]> {
  const response = await fetch(API_BASE_URL, { // GET /api/listings (root)
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<Listing[]>(response);
}

async function claimListing(listingId: string): Promise<Listing> {
  const response = await fetch(`${API_BASE_URL}/${listingId}/claim`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json', // Though body might be empty, good practice
      ...getAuthHeaders(),
    },
    // No body is typically needed for a claim action unless API requires it
  });
  return handleResponse<Listing>(response);
}

export const listingService = {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  getAvailableListings, // Added
  claimListing, // Added
};

export type { Listing, ListingData }; // Export types for use in components
