import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateListingPage: React.FC = () => {
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState(''); // Store as YYYY-MM-DD for input type="date"
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not a restaurant or not logged in (though App.tsx should handle this with ProtectedRoute)
  if (user?.role !== 'restaurant') {
    // This is a fallback, primary protection should be via routing
    navigate('/listings'); // Or to an unauthorized page
    return <p>You are not authorized to create listings.</p>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!foodItem || !quantity || !expiryDate) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await api.post('/listings', {
        foodItem,
        quantity,
        expiryDate, // Server expects a Date parsable string
      });

      if (response.data) {
        setSuccess('Listing created successfully! Redirecting to listings...');
        setFoodItem('');
        setQuantity('');
        setExpiryDate('');
        setTimeout(() => {
          navigate('/listings');
        }, 2000); // Wait 2 seconds before redirecting
      }
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err.response?.data?.message || 'Failed to create listing.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Create New Food Listing</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="foodItem" style={{ display: 'block', marginBottom: '5px' }}>Food Item:</label>
          <input
            type="text"
            id="foodItem"
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="quantity" style={{ display: 'block', marginBottom: '5px' }}>Quantity:</label>
          <input
            type="text"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            placeholder="e.g., 10 boxes, 5 kg"
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="expiryDate" style={{ display: 'block', marginBottom: '5px' }}>Expiry Date:</label>
          <input
            type="date" // Using date input for better UX
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Create Listing
        </button>
      </form>
    </div>
  );
};

export default CreateListingPage;
