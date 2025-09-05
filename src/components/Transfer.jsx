import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Transfer() {
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  const handleTransfer = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!receiverAccount || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in both fields with valid data.');
      return;
    }

    try {
      // Get user data from local storage
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.accountNumber) {
        alert('User not logged in.');
        return;
      }

      const senderAccount = userData.accountNumber;

      // Send transfer request to the backend
      const response = await axios.post('http://localhost:5001/api/transfer', {
        senderAccount,
        receiverAccount,
        amount: parseFloat(amount),
      });

      if (response.status === 200) {
        // Navigate back to the dashboard after successful transfer
        navigate('/dashboard');
      } else {
        alert('Transfer failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      alert('An error occurred while processing the transfer. Please try again.');
    }
  };

  return (

    <form onSubmit={handleTransfer} className="max-w-md mx-auto p-4 bg-white rounded-md shadow-md">
      <h2 className="text-lg font-bold mb-4">Transfer Amount</h2>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Receiver Account Number:</label>
          <input
            type="text"
            value={receiverAccount}
            onChange={(e) => setReceiverAccount(e.target.value)}
            required
            className="p-2 pl-10 text-sm border-2 border-blue-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Amount to Transfer:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="p-2 pl-10 text-sm border-2 border-blue-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Transfer
        </button>
      </div>
    </form>
  );
}
