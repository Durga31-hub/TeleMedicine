import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, Download, Activity as ActivityIcon, Clock } from 'lucide-react';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/prescription/patient/${user.id}`)
      .then(({ data }) => {
        setPrescriptions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="fade-in">Medical Records</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage all your past digital prescriptions.</p>
        </div>
        <div style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {prescriptions.length} Records Found
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Loading records...</div>
      ) : prescriptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
          <FileText size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
          <h3>No records yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Your prescriptions will appear here after your consultations.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {prescriptions.map(pres => (
            <div key={pres._id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#eff6ff', color: 'var(--accent)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <ActivityIcon size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--primary)', margin: 0 }}>Digital Prescription</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>ID: {pres._id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Dr. {pres.doctorId.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{pres.doctorId.specialization || 'General Physician'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</span>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> {new Date(pres.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</span>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {new Date(pres.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                  <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem' }}>● VERIFIED RECORD</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h5 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Diagnosis</h5>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>{pres.diagnosis}</p>
                </div>
                <div>
                  <h5 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prescribed Medications</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(() => {
                      let meds = [];
                      try {
                        meds = typeof pres.medicines === 'string' ? JSON.parse(pres.medicines) : pres.medicines;
                      } catch (e) { meds = []; }
                      
                      return meds.length > 0 ? meds.map((med, idx) => (
                        <div key={idx} style={{ background: 'white', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{med.name}</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>{med.dosage}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.frequency}</span>
                          </div>
                        </div>
                      )) : <p style={{ color: 'var(--text-muted)' }}>No medications listed.</p>;
                    })()}
                  </div>
                </div>
              </div>

              {pres.notes && (
                <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '1rem', fontSize: '0.95rem', color: '#1e293b', borderLeft: '4px solid var(--accent)', marginTop: '0.5rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Physician's Instructions</strong>
                  {pres.notes}
                </div>
              )}
              
              <div style={{ textAlign: 'right', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                 <button style={{ color: 'var(--accent)', background: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--accent)' }}>
                    <Download size={14} /> Download PDF Statement
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
