import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { NextPageWithLayout } from 'nextjs/types';

const AdminLogin: NextPageWithLayout = () => {
  const router = useRouter();
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState('');
  const [ loading, setLoading ] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      localStorage.setItem('admin_token', data.token);
      router.push('/admin');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Admin Login — Ather Chain</title></Head>
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          background: '#1e293b', borderRadius: 16, padding: '48px 40px',
          width: '100%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
              borderRadius: 14, margin: '0 auto 16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>⚙️</div>
            <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>Admin Panel</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '6px 0 0' }}>Ather Chain Explorer</p>
          </div>

          <form onSubmit={ handleSubmit }>
            { error && (
              <div style={{
                background: '#450a0a', border: '1px solid #b91c1c', borderRadius: 8,
                color: '#fca5a5', padding: '10px 14px', fontSize: 13, marginBottom: 20,
              }}>{ error }</div>
            ) }

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={ username }
                onChange={ (e) => setUsername(e.target.value) }
                required
                autoComplete="username"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 8, padding: '10px 14px', color: '#f1f5f9',
                  fontSize: 15, outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={ password }
                onChange={ (e) => setPassword(e.target.value) }
                required
                autoComplete="current-password"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 8, padding: '10px 14px', color: '#f1f5f9',
                  fontSize: 15, outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={ loading }
              style={{
                width: '100%', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                border: 'none', borderRadius: 8, padding: '12px',
                color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              { loading ? 'Signing in…' : 'Sign in' }
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

AdminLogin.getLayout = (page) => page;

export default AdminLogin;
