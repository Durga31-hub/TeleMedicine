import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isAppointmentActive } from '../utils/dateTimeUtils';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppNotification = () => {
  const { user } = useAuth();
  const [activeApp, setActiveApp] = useState(null);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const checkAppointments = async () => {
      try {
        const { data } = await api.get(`/appointment/user/${user.id}`);
        const live = data.find(app => {
          const { active } = isAppointmentActive(app.date, app.timeSlot);
          return active && app.status !== 'completed' && app.status !== 'rejected';
        });

        if (live && (!activeApp || activeApp._id !== live._id)) {
          setActiveApp(live);
          setShow(true);
          playChime();
        } else if (!live) {
          setShow(false);
          setActiveApp(null);
        }
      } catch (err) {
        console.error('Notification check failed', err);
      }
    };

    checkAppointments();
    const interval = setInterval(checkAppointments, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [user]); // Only re-run if session user changes

  const playChime = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.play().catch(e => console.log('Audio play blocked' , e));
  };

  if (!show || !activeApp) return null;

  return (
    <div className="fade-in" style={{ 
      position: 'fixed', 
      top: '1.5rem', 
      right: '1.5rem', 
      zIndex: 10000,
      background: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '1.25rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      border: '1px solid var(--border)',
      borderLeft: '4px solid var(--accent)',
      maxWidth: '400px'
    }}>
      <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '50%' }}>
        <Bell className="text-accent" size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '1rem' }}>Appointment is LIVE</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {user.role === 'patient' ? `Dr. ${activeApp.doctorId.name}` : `Patient: ${activeApp.patientId.name}`} is waiting.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => { navigate(`/consultation/${activeApp._id}`); setShow(false); }}>Join Now</button>
        <button onClick={() => setShow(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
      </div>
    </div>
  );
};

export default AppNotification;
