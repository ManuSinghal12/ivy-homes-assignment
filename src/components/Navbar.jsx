import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Heart, BarChart3, Home, LogOut, Key } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
    const navigate = useNavigate();

    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>
                <Building size={24} color="#2563eb" />
                <span style={styles.title}>Ivy Homes Portal</span>
            </div>
            {user && (
                <div style={styles.links}>
                    <Link to="/" style={styles.link}><Home size={18} /> Listings</Link>
                    <Link to="/rentals-projects" style={styles.link}><Building size={18} /> Rentals & Projects</Link>
                    <Link to="/favourites" style={styles.link}><Heart size={18} /> Saved</Link>
                    <Link to="/insights" style={styles.link}><BarChart3 size={18} /> Insights</Link>
                    <button onClick={() => { onLogout(); navigate('/login'); }} style={styles.logoutBtn}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#ffffff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    brand: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' },
    title: { color: '#1e293b' },
    links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
    link: { display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: '#4b5563', fontWeight: 500 },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};