import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { isAppointmentActive } from '../utils/dateTimeUtils';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [historyMessages, setHistoryMessages] = useState([]);
  const navigate = useNavigate();

  const fetchHistory = async (appId) => {
    const { data } = await api.get(`/appointment/${appId}/messages`);
    setHistoryMessages(data);
  };

  const fetchAppointments = async () => {
    const { data } = await api.get(`/appointment/user/${user.id}`);
    setAppointments(data);
  };

  useEffect(() => {
    fetchAppointments();
    const timer = setInterval(fetchAppointments, 60000);
    return () => clearInterval(timer);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointment/${id}/status`, { status });
      fetchAppointments();
    } catch (err) { alert('Update failed'); }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Doctor Dashboard</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {appointments.map(app => {
          const { active, label } = isAppointmentActive(app.date, app.timeSlot);
          return (
            <div key={app._id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'var(--primary)' }}>Patient: {app.patientId.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.date} at {app.timeSlot}</p>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '1rem',
                  background: app.status === 'approved' ? '#dcfce7' : app.status === 'pending' ? '#fef3c7' : '#fee2e2',
                  color: app.status === 'approved' ? '#166534' : app.status === 'pending' ? '#92400e' : '#991b1b',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>{app.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {app.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => updateStatus(app._id, 'approved')} style={{ background: 'var(--success)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <Check size={18} /> Approve
                    </button>
                    <button onClick={() => updateStatus(app._id, 'rejected')} style={{ background: 'var(--error)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <X size={18} /> Reject
                    </button>
                  </div>
                )}
                {app.status === 'approved' && (
                  active ? (
                    <button className="btn-primary" onClick={() => navigate(`/consultation/${app._id}`)}>Start Consultation</button>
                  ) : (
                    <button className="btn-disabled-pro" title="Join window not yet open">{label}</button>
                  )
                )}
                <button className="card" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => { setSelectedAppointment(app); fetchHistory(app._id); }}>Details</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment Modal */}
      {selectedAppointment && (
        <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2>Consultation with {selectedAppointment.patientId.name}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{selectedAppointment.date} at {selectedAppointment.timeSlot}</p>
              </div>
              <button onClick={() => setSelectedAppointment(null)} style={{ fontSize: '1.5rem', background: 'none' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ marginBottom: '1rem' }}>AI Diagnostic Findings</h4>
                {selectedAppointment.aiAnalysis ? (
                  <div className="card" style={{ background: '#f8fafc' }}>
                    <p><strong>Condition:</strong> {selectedAppointment.aiAnalysis.condition}</p>
                    <p><strong>Accuracy:</strong> {(selectedAppointment.aiAnalysis.confidence * 100).toFixed(0)}%</p>
                    <p style={{ marginTop: '0.5rem' }}><strong>Symptoms:</strong> {selectedAppointment.aiAnalysis.symptoms}</p>
                  </div>
                ) : <p style={{ color: 'var(--text-muted)' }}>No AI analysis has been performed yet.</p>}
              </div>

              <div>
                <h4 style={{ marginBottom: '1rem' }}>Chat History</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                  {historyMessages.length > 0 ? historyMessages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      <small style={{ color: 'var(--accent)', fontWeight: 700 }}>{m.senderId.name}</small>
                      <p style={{ fontSize: '0.9rem' }}>{m.text}</p>
                    </div>
                  )) : <p style={{ color: 'var(--text-muted)' }}>No messages exchanged.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
