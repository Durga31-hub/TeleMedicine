import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data } = await axios.get(`http://localhost:5000/api/appointment/user/${user.id}`);
    setAppointments(data);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/appointment/${id}/status`, { status });
      fetchAppointments();
    } catch (err) { alert('Update failed'); }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Doctor Dashboard</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {appointments.map(app => (
          <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>Patient: {app.patientId.name}</h4>
              <p>{app.date} at {app.timeSlot}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {app.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(app._id, 'approved')} style={{ background: 'var(--success)', color: 'white', padding: '0.5rem' }}><Check /></button>
                  <button onClick={() => updateStatus(app._id, 'rejected')} style={{ background: 'var(--error)', color: 'white', padding: '0.5rem' }}><X /></button>
                </>
              )}
              {app.status === 'approved' && (
                <button className="btn-primary" onClick={() => navigate(`/consultation/${app._id}`)}>Start Call</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
