import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Consultation from './pages/Consultation';
import Prescriptions from './pages/Prescriptions';

import AppNotification from './components/AppNotification';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppNotification />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/patient-dashboard" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
            <Route path="/doctor-dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
            <Route path="/prescriptions" element={<PrivateRoute role="patient"><Prescriptions /></PrivateRoute>} />
            <Route path="/consultation/:id" element={<PrivateRoute><Consultation /></PrivateRoute>} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
