import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Transfer from './components/Transfer';
import Deposit from './components/Deposit';
import Balance from './components/displayBalance';

// ProtectedRoute Component to ensure routes are accessible only if the user is logged in
const ProtectedRoute = ({ element }) => {
  const userData = JSON.parse(localStorage.getItem('userData')); // Retrieve user data from localStorage

  if (!userData || !userData.token) {
    // Redirect to login if no user is authenticated
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the requested component
  return element;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes - Accessible only after login */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/admin-panel"
          element={<ProtectedRoute element={<AdminPanel />} />}
        />
        <Route
          path="/transfer"
          element={<ProtectedRoute element={<Transfer />} />}
        />
        <Route
          path="/deposit"
          element={<ProtectedRoute element={<Deposit />} />}
        />
        <Route
          path="/balance"
          element={<ProtectedRoute element={<Balance />} />}
        />

        {/* Default route - Redirect to login if no match */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
