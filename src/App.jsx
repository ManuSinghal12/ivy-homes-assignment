import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import RentalsProjects from './pages/RentalsProjects';
import Favourites from './pages/Favourites';
import Insights from './pages/Insights';

export default function App() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ivy_user') || 'null'));

    const logout = () => { ['ivy_user', 'ivy_token', 'ivy_refresh_token', 'ivy_refresh_url', 'ivy_token_expires_at'].forEach(key => localStorage.removeItem(key)); setUser(null); };
    const protectedPage = (page) => user ? page : <Navigate to="/login" replace />;
    return (
        <Router>
            <Navbar user={user} onLogout={logout} />
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />} />
                <Route path="/" element={protectedPage(<Listings />)} />
                <Route path="/listings/:id" element={protectedPage(<ListingDetail />)} />
                <Route path="/rentals-projects" element={protectedPage(<RentalsProjects />)} />
                <Route path="/favourites" element={protectedPage(<Favourites />)} />
                <Route path="/insights" element={protectedPage(<Insights />)} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}
