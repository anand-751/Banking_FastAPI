import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Retrieve userData object from localStorage and parse it
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Check if userData or the token exists
    if (!userData || !userData.token) {
      setError('No token found. Please log in.');
      navigate('/login'); // Redirect to login page if no token is found
      return;
    }

    try {
      // Send the deposit request to the server with the token in the Authorization header
      const response = await axios.post(
        'http://localhost:5001/api/deposit',
        { amount: parseFloat(amount) }, // Send the deposit amount
        {
          headers: {
            Authorization: `Bearer ${userData.token}`, // Use the token from userData
          },
        }
      );

      console.log('[DEBUG] Backend Response:', response.data);

      if (response.data.success) {
        setSuccessMessage(`Deposit successful. New balance: ${response.data.newBalance}`);
      } else {
        setError(`Deposit failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('[ERROR] Axios request failed:', error.response || error.message);
      setError('An error occurred while processing your request.');
    }
  };


  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-md shadow-md">
      <h2 className="text-lg font-bold mb-4">Deposit Amount</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="p-2 pl-10 text-sm border-2 border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Deposit
        </button>
      </form>
      {error && (
        <div className="p-2 mt-4 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-2 mt-4 text-sm text-green-500 bg-green-100 rounded-md">
          {successMessage}
        </div>
      )}
    </div>
  );
}

