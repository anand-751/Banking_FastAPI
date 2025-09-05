import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Mail, Lock } from 'lucide-react';
import axios from 'axios';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Make the API call to login
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
      });

      // Check if login was successful
      if (response.data.token) {
        // Clear previous localStorage if any
        localStorage.clear();

        const userData = {
          token: response.data.token,
          accountNumber: response.data.accountNumber,
          message: response.data.message,
          role: response.data.role,
        };

        localStorage.setItem('userData', JSON.stringify(userData));

        // Redirect to the dashboard
        if (userData.role === 'admin') {
          navigate('/admin-panel'); // Redirect to admin panel
        } else if (userData.role === 'user') {
          navigate('/dashboard'); // Redirect to user dashboard
        } else {
          setError('Invalid user role. Please contact support.');
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('[ERROR] Login failed:', error.response || error.message);
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Landmark className="h-12 w-12 text-blue-600 mb-2" />
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
