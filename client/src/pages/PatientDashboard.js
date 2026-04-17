import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Video, User as UserIcon, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import { isAppointmentActive } from '../utils/dateTimeUtils';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [bookingData, setBookingData] = useState({ date: '', timeSlot: '' });
  const navigate = useNavigate();

  // Generate 9 AM to 9 PM slots
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const fetchHistory = async (appId) => {
    const { data } = await api.get(`/appointment/${appId}/messages`);
    setHistoryMessages(data);
  };

  const fetchDoctors = async () => {
    const { data } = await api.get('/doctor/all');
    setDoctors(data);
  };

  const fetchAppointments = async () => {
    const { data } = await api.get(`/appointment/user/${user.id}`);
    setAppointments(data);
  };

  const fetchRecentRecords = async () => {
    try {
      const { data } = await api.get(`/prescription/patient/${user.id}`);
      setRecentPrescriptions(data.slice(0, 2)); // Show only latest 2
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
    fetchRecentRecords();
    
    const timer = setInterval(() => {
        fetchAppointments();
        fetchRecentRecords();
    }, 60000);
    return () => clearInterval(timer);
  }, []); // Run once on mount

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointment/book', {
        patientId: user.id,
        doctorId: selectedDoctor._id,
        ...bookingData
      });
      alert('Appointment booked!');
      setSelectedDoctor(null);
      fetchAppointments();
    } catch (err) { alert(err.response?.data?.message || 'Booking failed'); }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Patient Dashboard</h1>
        <Link to="/prescriptions" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)' }}>
          <FileText size={18} /> My Medical Records
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <section>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon className="text-accent" /> Available Doctors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {doctors.map(doc => (
              <div key={doc._id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--primary)' }}>{doc.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.specialization}</p>
                </div>
                <button className="btn-primary" onClick={() => setSelectedDoctor(doc)}>Book</button>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: '1rem', marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText className="text-accent" /> Recent Records</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentPrescriptions.length > 0 ? recentPrescriptions.map(pres => (
              <div key={pres._id} className="card glass" style={{ borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                   <span>{new Date(pres.createdAt).toLocaleDateString()}</span>
                   <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{pres.diagnosis}</span>
                </div>
                <div style={{ fontWeight: 600 }}>Dr. {pres.doctorId.name}</div>
                <Link to="/prescriptions" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', marginTop: '0.5rem', display: 'block' }}>View Full Record →</Link>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent medical records found.</p>}
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar className="text-accent" /> Appointments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map(app => {
              const { active, label } = isAppointmentActive(app.date, app.timeSlot);
              return (
                <div key={app._id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--primary)' }}>Dr. {app.doctorId.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.date} at {app.timeSlot}</p>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '1rem',
                        background: app.status === 'approved' ? '#dcfce7' : app.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: app.status === 'approved' ? '#166534' : app.status === 'pending' ? '#92400e' : '#991b1b',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>{app.status}</span>
                      {app.status === 'pending' && <small style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>Waiting for Dr...</small>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {app.status !== 'rejected' ? (
                      active ? (
                        <button className="btn-primary" onClick={() => navigate(`/consultation/${app._id}`)}>Join Call</button>
                      ) : (
                        <button className="btn-disabled-pro" title="Join window not yet open">{label}</button>
                      )
                    ) : (
                      <button className="card" disabled style={{ opacity: 0.5, cursor: 'not-allowed', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Blocked</button>
                    )}
                    <button className="card" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => { setSelectedAppointment(app); fetchHistory(app._id); }}>Details</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Appointment Modal */}
      {selectedAppointment && (
        <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2>Consultation with Dr. {selectedAppointment.doctorId.name}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{selectedAppointment.date} at {selectedAppointment.timeSlot}</p>
              </div>
              <button onClick={() => setSelectedAppointment(null)} style={{ fontSize: '1.5rem', background: 'none' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* AI Summary */}
              <div>
                <h4 style={{ marginBottom: '1rem' }}>AI Diagnostic Findings</h4>
                {selectedAppointment.aiAnalysis ? (
                  <div className="card" style={{ background: '#f8fafc' }}>
                    <p><strong>Condition:</strong> {selectedAppointment.aiAnalysis.condition}</p>
                    <p><strong>Accuracy:</strong> {(selectedAppointment.aiAnalysis.confidence * 100).toFixed(0)}%</p>
                    <p style={{ marginTop: '0.5rem' }}><strong>Symptoms:</strong> {selectedAppointment.aiAnalysis.symptoms}</p>
                  </div>
                ) : <p style={{ color: 'var(--text-muted)' }}>No AI data available for this appointment.</p>}
              </div>

              {/* Chat History */}
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

      {selectedDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '400px' }}>
            <h3>Book {selectedDoctor.name}</h3>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="date" required onChange={e => setBookingData({...bookingData, date: e.target.value})} />
              <select required onChange={e => setBookingData({...bookingData, timeSlot: e.target.value})}>
                <option value="">Choose slot...</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setSelectedDoctor(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
