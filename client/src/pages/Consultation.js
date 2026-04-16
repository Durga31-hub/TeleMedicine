import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Peer from 'simple-peer';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';
import axios from 'axios';

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

  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();

  useEffect(() => {
    if (!socket) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
        socket.emit('join-room', roomId);
        
        socket.on('signal', data => {
          if (peerRef.current) peerRef.current.signal(data.signal);
          else createPeer(data.signal, false, currentStream);
        });

        socket.on('receive-message', msg => setMessages(p => [...p, msg]));
        if (user.role === 'doctor') createPeer(null, true, currentStream);
      });
    return () => { 
      if (stream) stream.getTracks().forEach(t => t.stop()); 
      if (socket) socket.off('signal');
    };
  }, [socket, roomId]);

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
    if (user.role === 'doctor') axios.patch(`http://localhost:5000/api/appointment/${roomId}/status`, { status: 'completed' });
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="container" style={{ padding: '1rem', height: 'calc(100vh - 80px)', display: 'flex', gap: '1rem' }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ flex: 1, background: '#1e293b', borderRadius: '1rem', position: 'relative', overflow: 'hidden' }}>
          <video playsInline ref={userVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '200px', height: '150px', borderRadius: '0.5rem', overflow: 'hidden', border: '2px solid white' }}>
            <video playsInline muted ref={myVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem' }}>
            <button onClick={() => { stream.getAudioTracks()[0].enabled = !isMicOn; setIsMicOn(!isMicOn); }} className="card" style={{ padding: '0.75rem', borderRadius: '50%' }}>{isMicOn ? <Mic /> : <MicOff />}</button>
            <button onClick={handleEndCall} style={{ background: 'var(--error)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '2rem' }}><PhoneOff /> End</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3>Chat</h3>
        <div style={{ flex: 1, overflowY: 'auto', margin: '1rem 0' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.senderId === user.id ? 'flex-end' : 'flex-start', background: m.senderId === user.id ? 'var(--accent)' : '#f1f5f9', color: m.senderId === user.id ? 'white' : 'black', margin: '0.25rem', padding: '0.5rem', borderRadius: '0.5rem' }}>
              {m.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} />
          <button type="submit" className="btn-primary"><Send /></button>
        </form>
      </div>
    </div>
  );
};

export default Consultation;
