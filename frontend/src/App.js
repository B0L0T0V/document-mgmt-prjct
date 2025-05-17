import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import EditDocument from './pages/EditDocument';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import History from './pages/History';
import Approval from './pages/Approval';
import Administration from './pages/Administration';
import Help from './pages/Help';
import UserManagement from './pages/UserManagement';

// Route guard component
const ProtectedRoute = ({ element, requiredRoles = [], ...rest }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || !user.id) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return element;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes available to all authenticated users */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/documents" element={<ProtectedRoute element={<Documents />} />} />
          <Route path="/documents/:id" element={<ProtectedRoute element={<EditDocument />} />} />
          <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/history" element={<ProtectedRoute element={<History />} />} />
          <Route path="/help" element={<ProtectedRoute element={<Help />} />} />
          
          {/* Routes available to managers and admins */}
          <Route path="/approval" element={<ProtectedRoute element={<Approval />} requiredRoles={['manager', 'admin']} />} />
          
          {/* Routes available only to admins */}
          <Route path="/admin" element={<ProtectedRoute element={<Administration />} requiredRoles={['admin']} />} />
          <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} requiredRoles={['admin']} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;