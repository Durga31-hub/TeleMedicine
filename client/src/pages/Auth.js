import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient', specialization: '', bio: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const url = `http://localhost:5000/api/auth/${isLogin ? 'login' : 'register'}`;
    try {
      const { data } = await axios.post(url, formData);
      login(data.user, data.token);
      navigate(data.user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    } catch (err) {
      console.error('Frontend Auth Error:', err);
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div className="text-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
              {formData.role === 'doctor' && (
                <>
                  <input type="text" placeholder="Specialization" onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                  <textarea placeholder="Bio" onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                </>
              )}
            </>
          )}
          <input type="email" placeholder="Email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
