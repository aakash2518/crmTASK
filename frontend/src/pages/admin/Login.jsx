import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in as admin
    if (user && user.role === 'ADMIN') {
      navigate('/admin/dashboard');
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
    const result = await login(email, password, 'admin');
    
    if (result.success) {
      navigate('/admin/dashboard');
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
          <ShieldCheck size={64} style={{ marginBottom: '2rem', opacity: 0.9 }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
            Manage your entire CRM from one place.
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.8, marginBottom: '3rem' }}>
            Powerful admin controls, dynamic modules, and role-based access built for modern teams.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Secure & Reliable</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Enterprise-grade security and role-based access control.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
               <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Dynamic Modules</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Create and manage custom data modules instantly.</p>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Admin Sign In</h2>
            <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>Sign in to manage the CRM system</p>
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
                placeholder="admin@example.com"
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
              {isLoading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              Are you a Manager? <a href="/manager/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Log in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
