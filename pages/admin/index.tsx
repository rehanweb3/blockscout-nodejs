import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { NextPageWithLayout } from 'nextjs/types';

type Tab = 'tokens' | 'blacklist';

interface Token {
  address: string;
  name: string | null;
  symbol: string | null;
  type: string | null;
  decimals: number | null;
  total_supply: string | null;
  holders_count: number | null;
}

const S = {
  root: {
    minHeight: '100vh', background: '#0f172a', color: '#f1f5f9',
    fontFamily: 'Inter, system-ui, sans-serif', display: 'flex',
  } as React.CSSProperties,
  sidebar: {
    width: 220, background: '#1e293b', display: 'flex', flexDirection: 'column' as const,
    padding: '24px 0', borderRight: '1px solid #334155', flexShrink: 0,
  },
  brand: {
    padding: '0 20px 24px', borderBottom: '1px solid #334155',
  },
  brandTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: 0 },
  brandSub: { color: '#64748b', fontSize: 12, margin: '2px 0 0' },
  nav: { padding: '16px 12px', flex: 1 },
  navItem: (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? '#60a5fa' : '#94a3b8',
    border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
    marginBottom: 4,
  }),
  logoutBtn: {
    margin: '0 12px', padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
    fontSize: 14, fontWeight: 500, color: '#f87171', background: 'transparent',
    border: '1px solid #450a0a', textAlign: 'left' as const, width: 'calc(100% - 24px)',
  },
  main: { flex: 1, padding: '32px 40px', overflow: 'auto' },
  heading: { fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#f1f5f9' },
  table: {
    width: '100%', borderCollapse: 'collapse' as const,
    background: '#1e293b', borderRadius: 12, overflow: 'hidden',
    fontSize: 13,
  },
  th: {
    padding: '12px 16px', textAlign: 'left' as const, color: '#64748b',
    background: '#0f172a', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  td: { padding: '12px 16px', borderTop: '1px solid #334155', verticalAlign: 'middle' as const },
  badge: (type: string): React.CSSProperties => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
    background: type === 'ERC-721' ? 'rgba(168,85,247,0.15)' : type === 'ERC-1155' ? 'rgba(234,88,12,0.15)' : 'rgba(59,130,246,0.15)',
    color: type === 'ERC-721' ? '#c084fc' : type === 'ERC-1155' ? '#fb923c' : '#60a5fa',
  }),
  input: {
    background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
    padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box' as const,
  },
  btn: (variant: 'primary' | 'danger'): React.CSSProperties => ({
    padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600,
    fontSize: 14, cursor: 'pointer',
    background: variant === 'primary' ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : '#7f1d1d',
    color: '#fff',
  }),
  empty: { textAlign: 'center' as const, color: '#64748b', padding: '48px 0', fontSize: 14 },
  blAddr: {
    fontFamily: 'monospace', fontSize: 13, color: '#94a3b8',
    background: '#0f172a', padding: '4px 10px', borderRadius: 6,
  },
};

function authFetch(url: string, opts: RequestInit = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : '';
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ token }`, ...(opts.headers || {}) },
  });
}

const AdminPanel: NextPageWithLayout = () => {
  const router = useRouter();
  const [ tab, setTab ] = useState<Tab>('tokens');
  const [ tokens, setTokens ] = useState<Token[]>([]);
  const [ blacklist, setBlacklist ] = useState<string[]>([]);
  const [ newAddr, setNewAddr ] = useState('');
  const [ loadingTokens, setLoadingTokens ] = useState(false);
  const [ loadingBl, setLoadingBl ] = useState(false);
  const [ addError, setAddError ] = useState('');
  const [ addSuccess, setAddSuccess ] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    loadTokens();
    loadBlacklist();
  }, []);

  const loadTokens = useCallback(async () => {
    setLoadingTokens(true);
    try {
      const res = await authFetch('/api/admin/tokens');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      setTokens(data.items || []);
    } finally {
      setLoadingTokens(false);
    }
  }, [ router ]);

  const loadBlacklist = useCallback(async () => {
    setLoadingBl(true);
    try {
      const res = await authFetch('/api/admin/blacklist');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      setBlacklist(data.items || []);
    } finally {
      setLoadingBl(false);
    }
  }, [ router ]);

  async function handleAddBlacklist(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    const res = await authFetch('/api/admin/blacklist', {
      method: 'POST',
      body: JSON.stringify({ address: newAddr.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error || 'Failed'); return; }
    setAddSuccess(`${ data.address } added to blacklist`);
    setNewAddr('');
    loadBlacklist();
  }

  async function handleRemove(addr: string) {
    await authFetch(`/api/admin/blacklist/${ addr }`, { method: 'DELETE' });
    setBlacklist((prev) => prev.filter((a) => a !== addr));
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  }

  return (
    <>
      <Head><title>Admin Panel — Ather Chain</title></Head>
      <div style={ S.root }>
        <aside style={ S.sidebar }>
          <div style={ S.brand }>
            <p style={ S.brandTitle }>⚙️ Admin Panel</p>
            <p style={ S.brandSub }>Ather Chain Explorer</p>
          </div>
          <nav style={ S.nav }>
            <div style={ S.navItem(tab === 'tokens') } onClick={ () => setTab('tokens') }>
              🪙 Tokens
            </div>
            <div style={ S.navItem(tab === 'blacklist') } onClick={ () => setTab('blacklist') }>
              🚫 Blacklist
              { blacklist.length > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#7f1d1d', color: '#fca5a5',
                  fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                }}>{ blacklist.length }</span>
              ) }
            </div>
          </nav>
          <button style={ S.logoutBtn } onClick={ handleLogout }>↩ Logout</button>
        </aside>

        <main style={ S.main }>
          { tab === 'tokens' && (
            <>
              <h2 style={ S.heading }>All Tokens</h2>
              { loadingTokens ? (
                <p style={{ color: '#64748b' }}>Loading…</p>
              ) : tokens.length === 0 ? (
                <p style={ S.empty }>No tokens found in the database.</p>
              ) : (
                <table style={ S.table }>
                  <thead>
                    <tr>
                      <th style={ S.th }>Name / Symbol</th>
                      <th style={ S.th }>Type</th>
                      <th style={ S.th }>Address</th>
                      <th style={ S.th }>Decimals</th>
                      <th style={ S.th }>Holders</th>
                    </tr>
                  </thead>
                  <tbody>
                    { tokens.map((t) => (
                      <tr key={ t.address }>
                        <td style={ S.td }>
                          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{ t.name || '—' }</span>
                          { t.symbol && <span style={{ color: '#64748b', marginLeft: 6 }}>{ t.symbol }</span> }
                        </td>
                        <td style={ S.td }>
                          { t.type ? <span style={ S.badge(t.type) }>{ t.type }</span> : '—' }
                        </td>
                        <td style={ S.td }>
                          <span style={ S.blAddr }>{ t.address.slice(0, 10) }…{ t.address.slice(-6) }</span>
                        </td>
                        <td style={ S.td }>{ t.decimals ?? '—' }</td>
                        <td style={ S.td }>{ t.holders_count ?? 0 }</td>
                      </tr>
                    )) }
                  </tbody>
                </table>
              ) }
            </>
          ) }

          { tab === 'blacklist' && (
            <>
              <h2 style={ S.heading }>Wallet Blacklist</h2>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
                Blacklisted wallets are hidden from all transaction lists and their transaction history is suppressed.
              </p>

              <form onSubmit={ handleAddBlacklist } style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <input
                  style={{ ...S.input, flex: 1 }}
                  value={ newAddr }
                  onChange={ (e) => { setNewAddr(e.target.value); setAddError(''); setAddSuccess(''); } }
                  placeholder="0x… wallet address"
                  pattern="^0x[0-9a-fA-F]{40}$"
                  required
                />
                <button type="submit" style={ S.btn('primary') }>Add to Blacklist</button>
              </form>

              { addError && (
                <div style={{
                  background: '#450a0a', border: '1px solid #b91c1c', borderRadius: 8,
                  color: '#fca5a5', padding: '10px 14px', fontSize: 13, marginBottom: 16,
                }}>{ addError }</div>
              ) }
              { addSuccess && (
                <div style={{
                  background: '#052e16', border: '1px solid #166534', borderRadius: 8,
                  color: '#86efac', padding: '10px 14px', fontSize: 13, marginBottom: 16,
                }}>{ addSuccess }</div>
              ) }

              { loadingBl ? (
                <p style={{ color: '#64748b' }}>Loading…</p>
              ) : blacklist.length === 0 ? (
                <p style={ S.empty }>No wallets are blacklisted.</p>
              ) : (
                <table style={ S.table }>
                  <thead>
                    <tr>
                      <th style={ S.th }>Wallet Address</th>
                      <th style={ S.th }></th>
                    </tr>
                  </thead>
                  <tbody>
                    { blacklist.map((addr) => (
                      <tr key={ addr }>
                        <td style={ S.td }>
                          <span style={{ ...S.blAddr, fontSize: 14 }}>{ addr }</span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <button
                            onClick={ () => handleRemove(addr) }
                            style={{ ...S.btn('danger'), padding: '6px 14px', fontSize: 13 }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )) }
                  </tbody>
                </table>
              ) }
            </>
          ) }
        </main>
      </div>
    </>
  );
};

AdminPanel.getLayout = (page) => page;

export default AdminPanel;
