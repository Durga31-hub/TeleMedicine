import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Video, Award } from 'lucide-react';

const Home = () => {
  return (
    <div className="fade-in">
      <section style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', 
        color: 'white', 
        padding: '5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>
            Healthcare at Your <span style={{ color: 'var(--accent)' }}>Fingerprints</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
            Connect with top-rated doctors instantly via secure video consultations. 
            Get expert advice, prescriptions, and care from the comfort of your home.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/auth" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3.5rem', fontSize: '2.5rem' }}>Why Choose TeleCare?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
            <FeatureCard 
              icon={<Shield size={40} className="text-accent" />}
              title="Secure & Private"
              desc="Your data is encrypted and consultations are strictly confidential."
            />
            <FeatureCard 
              icon={<Video size={40} className="text-accent" />}
              title="HD Video Calls"
              desc="Crystal clear real-time communication with our peer-to-peer technology."
            />
            <FeatureCard 
              icon={<Clock size={40} className="text-accent" />}
              title="Instant Booking"
              desc="Book appointments with specialized doctors in under 60 seconds."
            />
            <FeatureCard 
              icon={<Award size={40} className="text-accent" />}
              title="Expert Doctors"
              desc="Access board-certified professionals across all medical fields."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </div>
);

export default Home;
