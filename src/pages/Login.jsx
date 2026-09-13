import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('demo1@ivy.homes');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginUser(email, password);
            onLogin(data.user || { email });
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2 style={{ marginTop: 0 }}>Ivy Homes Portal</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Log in using one of the demo accounts.
                </p>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <select
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    >
                        <option value="demo1@ivy.homes">demo1@ivy.homes</option>
                        <option value="demo2@ivy.homes">demo2@ivy.homes</option>
                        <option value="demo3@ivy.homes">demo3@ivy.homes</option>
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        placeholder="Enter password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <button type="submit" disabled={loading} style={styles.btn}>
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
    card: { background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '380px', border: '1px solid #e2e8f0' },
    field: { marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: { fontSize: '0.875rem', fontWeight: 600, color: '#334155' },
    input: { padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' },
    btn: { width: '100%', padding: '0.8rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.5rem' },
    error: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.6rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }
};