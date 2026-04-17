import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Peer from 'simple-peer';
import api from '../utils/api';
import SymptomChecker from '../components/SymptomChecker';
import { Mic, MicOff, PhoneOff, Send, Brain, FileText, Activity as ActivityIcon } from 'lucide-react';

const Consultation = () => {
  const { id: roomId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showSymptomChecker, setShowSymptomChecker] = useState(user.role === 'patient');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescription, setPrescription] = useState({ 
    diagnosis: '', 
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '' }]
  });

  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();

  const handleAiSuggest = () => {
    if (aiAnalysis) {
      setPrescription({
        ...prescription,
        diagnosis: aiAnalysis.condition,
        notes: `AI Severity: ${aiAnalysis.severity}. Patient reported: ${aiAnalysis.symptoms}`
      });
    }
  };

  const savePrescription = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prescription/create', {
        appointmentId: roomId,
        patientId: remoteStream ? 'placeholder-id' : 'placeholder-id', // We need the actual patient ID from currentApp
        doctorId: user.id,
        ...prescription,
        medicines: JSON.stringify(prescription.medicines) // Matching the existing frontend expectation
      });
      alert('Prescription Saved!');
      setShowPrescriptionForm(false);
    } catch (err) { alert('Failed to save prescription'); }
  };

  useEffect(() => {
    // Fetch Appointment and AI Data
    api.get(`/appointment/user/${user.id}`)
      .then(({ data }) => {
        const currentApp = data.find(a => a._id === roomId);
        if (currentApp) {
          if (currentApp.aiAnalysis) {
            setAiAnalysis(currentApp.aiAnalysis);
            if (user.role === 'patient') setShowSymptomChecker(false);
          }
          // Store actual IDs for prescription
          setPrescription(p => ({ ...p, 
            patientId: currentApp.patientId._id,
            doctorId: currentApp.doctorId._id 
          }));
        }
      });

    api.get(`/appointment/${roomId}/messages`)
      .then(({ data }) => {
        const history = data.map(m => ({
          senderId: m.senderId._id,
          senderName: m.senderId.name,
          text: m.text,
          createdAt: m.createdAt
        }));
        setMessages(history);
      });
  }, [roomId, user.id, user.role]);

  useEffect(() => {
    if (!socket || showSymptomChecker) return;
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
        socket.emit('join-room', roomId);
        
        socket.on('signal', data => {
          if (peerRef.current) peerRef.current.signal(data.signal);
          else createPeer(data.signal, false, currentStream);
        });

        socket.on('receive-message', msg => {
          setMessages(prev => {
            const exists = prev.some(m => m.text === msg.text && m.createdAt === msg.createdAt);
            if (exists) return prev;
            return [...prev, msg];
          });
        });

        if (user.role === 'doctor') createPeer(null, true, currentStream);
      });

    return () => { 
      if (stream) stream.getTracks().forEach(t => t.stop()); 
      if (socket) {
        socket.off('signal');
        socket.off('receive-message');
      }
    };
  }, [socket, roomId, user.role, showSymptomChecker]);

  const createPeer = (incomingSignal, initiator, currentStream) => {
    const peer = new Peer({ initiator, trickle: false, stream: currentStream });
    peer.on('signal', signal => socket.emit('signal', { roomId, signal, from: user.id }));
    peer.on('stream', remStream => {
      setRemoteStream(remStream);
      if (userVideo.current) userVideo.current.srcObject = remStream;
    });
    if (incomingSignal) peer.signal(incomingSignal);
    peerRef.current = peer;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage) return;
    socket.emit('send-message', { roomId, senderId: user.id, senderName: user.name, text: inputMessage });
    setInputMessage('');
  };

  const handleEndCall = () => {
    if (user.role === 'doctor') api.patch(`/appointment/${roomId}/status`, { status: 'completed' });
    navigate('/');
    window.location.reload();
  };

  if (showSymptomChecker) {
    return <div className="container" style={{ padding: '2rem 0' }}><SymptomChecker appointmentId={roomId} onComplete={() => setShowSymptomChecker(false)} /></div>;
  }

  return (
    <div className="container" style={{ padding: '1rem', height: 'calc(100vh - 80px)', display: 'flex', gap: '1rem' }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ flex: 1, background: '#1e293b', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <video playsInline ref={userVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '220px', height: '160px', borderRadius: '1rem', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', boxShadow: 'var(--shadow)' }}>
            <video playsInline muted ref={myVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.4)', padding: '0.75rem 1.5rem', borderRadius: '3rem', backdropFilter: 'blur(8px)' }}>
            <button onClick={() => { stream.getAudioTracks()[0].enabled = !isMicOn; setIsMicOn(!isMicOn); }} style={{ background: isMicOn ? 'white' : 'var(--error)', color: isMicOn ? 'black' : 'white', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isMicOn ? <Mic size={20} /> : <MicOff size={20} />}</button>
            <button onClick={handleEndCall} style={{ background: 'var(--error)', color: 'white', padding: '0 2rem', borderRadius: '2.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PhoneOff size={20} /> End Meeting</button>
            {user.role === 'doctor' && (
              <button onClick={() => setShowPrescriptionForm(true)} style={{ background: 'var(--accent)', color: 'white', padding: '0 1.5rem', borderRadius: '2.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} /> Write Prescription
              </button>
            )}
          </div>
        </div>
        
        {/* Prescription Modal */}
        {showPrescriptionForm && (
          <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Digital Prescription</h3>
                <button onClick={() => setShowPrescriptionForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>&times;</button>
              </div>
              <form onSubmit={savePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 600 }}>Diagnosis</label>
                    {aiAnalysis && <button type="button" onClick={handleAiSuggest} style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>✨ AI Suggest</button>}
                  </div>
                  <input type="text" required value={prescription.diagnosis} onChange={e => setPrescription({...prescription, diagnosis: e.target.value})} placeholder="e.g. Acute Viral Pharyngitis" />
                </div>
                <div>
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Medications</label>
                  {prescription.medicines.map((med, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input type="text" placeholder="Medicine" value={med.name} onChange={e => {
                        const newMeds = [...prescription.medicines];
                        newMeds[idx].name = e.target.value;
                        setPrescription({...prescription, medicines: newMeds});
                      }} />
                      <input type="text" placeholder="Dosage" value={med.dosage} onChange={e => {
                        const newMeds = [...prescription.medicines];
                        newMeds[idx].dosage = e.target.value;
                        setPrescription({...prescription, medicines: newMeds});
                      }} />
                      <input type="text" placeholder="Freq" value={med.frequency} onChange={e => {
                        const newMeds = [...prescription.medicines];
                        newMeds[idx].frequency = e.target.value;
                        setPrescription({...prescription, medicines: newMeds});
                      }} />
                      <button type="button" onClick={() => {
                        const newMeds = prescription.medicines.filter((_, i) => i !== idx);
                        setPrescription({...prescription, medicines: newMeds});
                      }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.5rem' }}>&times;</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setPrescription({...prescription, medicines: [...prescription.medicines, { name: '', dosage: '', frequency: '' }]})} style={{ width: '100%', padding: '0.5rem', border: '1px dashed var(--border)', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>+ Add Medicine</button>
                </div>
                <div>
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Notes & Instructions</label>
                  <textarea rows="3" value={prescription.notes} onChange={e => setPrescription({...prescription, notes: e.target.value})} placeholder="Take after food, avoid cold drinks..." />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowPrescriptionForm(false)} className="card" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Sign & Save Record</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Info Panel for Doctor */}
        {aiAnalysis && (
          <div className="card glass fade-in" style={{ padding: '1.5rem', borderLeft: '5px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Brain className="text-accent" />
              <h3 style={{ margin: 0 }}>AI Patient Insights</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <div><small style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suspected</small><p style={{ fontWeight: 700 }}>{aiAnalysis.condition}</p></div>
              <div><small style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</small><p style={{ fontWeight: 700, color: 'var(--accent)' }}>{(aiAnalysis.confidence * 100).toFixed(0)}%</p></div>
              <div><small style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>Severity</small><p style={{ fontWeight: 700 }}>{aiAnalysis.severity}</p></div>
              <div><small style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>Symptoms</small><p style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{aiAnalysis.symptoms}</p></div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '1.5rem' }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Chat <span style={{ background: '#eff6ff', color: 'var(--accent)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>Real-time</span></h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', padding: '0 0.5rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.senderId === user.id ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
              <div style={{ 
                maxBurn: '80%', 
                background: m.senderId === user.id ? 'var(--accent)' : '#f1f5f9', 
                color: m.senderId === user.id ? 'white' : 'var(--text)', 
                padding: '0.75rem 1rem', 
                borderRadius: m.senderId === user.id ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {m.text}
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                {m.senderName} • {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </small>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '1rem' }}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputMessage} 
            onChange={e => setInputMessage(e.target.value)} 
            style={{ border: 'none', background: 'transparent' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem' }}><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
};

export default Consultation;
