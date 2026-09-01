import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Eye, EyeOff } from 'lucide-react';

const ManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in as manager
    if (user && user.role === 'MANAGER') {
      navigate('/manager/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, 'manager');
    
    if (result.success) {
      navigate('/manager/dashboard');
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Left Vibrant Blue Panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10%',
        position: 'relative',
        overflow: 'hidden'
      }} className="hidden-mobile">
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <Briefcase size={64} style={{ marginBottom: '2rem', opacity: 0.9 }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
            Focus on bringing sales while iCRM manages the rest.
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.8, marginBottom: '3rem' }}>
            Access your assigned modules, manage data efficiently, and boost productivity.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Automate your work</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Streamline processes and save time every day.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
               <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Something for everyone</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>The best customer experiences are built with iCRM.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right White Form Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
             <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginBottom: '0.5rem' }}>
              iCRM<span style={{ color: '#f59e0b' }}>.</span>
            </h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Manager Sign In</h2>
            <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>Sign in to access your modules</p>
          </div>
          
          {error && (
            <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', border: '1px solid #fca5a5' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="email" style={{ fontWeight: 600 }}>Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="manager@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                style={{ padding: '0.75rem', backgroundColor: '#f8fafc' }}
              />
            </div>
            
            <div className="form-group" style={{ position: 'relative', marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="password" style={{ fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ padding: '0.75rem', paddingRight: '2.5rem', backgroundColor: '#f8fafc' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn w-full" 
              disabled={isLoading}
              style={{ padding: '0.875rem', backgroundColor: '#2563eb', color: 'white', fontSize: '1rem', fontWeight: 600, borderRadius: 'var(--radius-md)' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In as Manager'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              Are you an Admin? <a href="/admin/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Log in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;
