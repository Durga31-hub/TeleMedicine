import React, { useState } from 'react';
import api from '../utils/api';
import { Brain, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const SymptomChecker = ({ appointmentId, onComplete }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/ai/analyze/${appointmentId}`, { symptoms });
      setResult(data);
    } catch (err) {
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="card glass fade-in" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ background: 'var(--success)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={32} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>AI Diagnostic Summary</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Our AI has analyzed your symptoms for the doctor.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Suspected Condition</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{result.condition}</p>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>AI Confidence</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem', color: 'var(--accent)' }}>{(result.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a', textAlign: 'left', marginBottom: '2rem', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', marginBottom: '0.5rem' }}>
            <AlertTriangle size={18} />
            <strong style={{ fontSize: '0.9rem' }}>Severity: {result.severity}</strong>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#92400e' }}>{result.advice}</p>
        </div>

        <button onClick={onComplete} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
          Continue to Video Consultation <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="card glass fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--accent)', color: 'white', padding: '0.75rem', borderRadius: '1rem' }}>
          <Brain size={32} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Smart Symptom Checker</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Powered by TeleCare AI Diagnostics</p>
        </div>
      </div>

      <p style={{ marginBottom: '1.5rem' }}>
        Please describe how you are feeling in your own words. The more detail you provide, the more accurately our AI can assist your doctor.
      </p>

      <form onSubmit={handleAnalyze}>
        <textarea
          required
          placeholder="e.g., I've had a dry cough for 3 days and a slight fever starting this morning..."
          style={{ height: '150px', marginBottom: '1.5rem', resize: 'none' }}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
          {loading ? 'AI analyzing symptoms...' : 'Analyze Symptoms'}
        </button>
      </form>
      
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
        Note: This is an AI-assisted tool and should not be used for emergency situations. 
        Always consult with your doctor for a final diagnosis.
      </p>
    </div>
  );
};

export default SymptomChecker;
