import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DisplayBalance = () => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (!userData) {
        console.error("No user data found in localStorage.");
        setError("User data not found. Please log in again.");
        navigate("/login");
    } else {
        const { accountNumber } = JSON.parse(userData);
        console.log("Extracted accountNumber from userData:", accountNumber); // Debugging log
        fetchBalance(accountNumber);
    }
}, [navigate]);



const fetchBalance = async (accountNumber) => {
    try {
        console.log("Sending accountNumber to backend:", accountNumber); // Debugging log

        const response = await axios.get(`http://localhost:5001/api/balance`, {
            params: { accountNumber }, // Query parameter
        });

        console.log("API response:", response.data); // Debugging log
        setBalance(response.data.balance);
    } catch (err) {
        console.error(
          "Error fetching balance:",
          err.response ? err.response.data : err
        );
        setError("Unable to fetch balance. Please try again later.");
      }
    };


  

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Balance</h2>
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : balance !== null ? (
                    <table className="table-auto w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">Account</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">Your Account</td>
                                <td className="border border-gray-300 px-4 py-2">${balance}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <p>Loading balance...</p>
                )}
            </div>
        </div>
    );
};

export default DisplayBalance;
