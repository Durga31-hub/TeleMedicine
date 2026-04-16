import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar" style={{
      background: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--accent)', fontSize: '1.25rem', fontWeight: 700 }}>
        <Activity size={28} />
        TeleCare
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500 }}>
              Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <UserIcon size={18} />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn-primary">
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
