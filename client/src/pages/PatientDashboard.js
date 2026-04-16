import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Video, Clock, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({ date: '', timeSlot: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    const { data } = await axios.get('http://localhost:5000/api/doctor/all');
    setDoctors(data);
  };

  const fetchAppointments = async () => {
    const { data } = await axios.get(`http://localhost:5000/api/appointment/user/${user.id}`);
    setAppointments(data);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointment/book', {
        patientId: user.id,
        doctorId: selectedDoctor._id,
        ...bookingData
      });
      alert('Appointment booked!');
      setSelectedDoctor(null);
      fetchAppointments();
    } catch (err) { alert('Booking failed'); }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Patient Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <section>
          <h3><UserIcon /> Doctors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {doctors.map(doc => (
              <div key={doc._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h4>{doc.name}</h4><p>{doc.specialization}</p></div>
                <button className="btn-primary" onClick={() => setSelectedDoctor(doc)}>Book</button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3><Calendar /> Appointments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {appointments.map(app => (
              <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>Dr. {app.doctorId.name}</h4>
                  <p>{app.date} at {app.timeSlot}</p>
                </div>
                {app.status === 'approved' && (
                  <button className="btn-primary" onClick={() => navigate(`/consultation/${app._id}`)}>Join</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '400px' }}>
            <h3>Book {selectedDoctor.name}</h3>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="date" required onChange={e => setBookingData({...bookingData, date: e.target.value})} />
              <select required onChange={e => setBookingData({...bookingData, timeSlot: e.target.value})}>
                <option value="">Choose slot...</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
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
