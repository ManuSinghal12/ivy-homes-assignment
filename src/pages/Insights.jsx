import React, { useEffect, useState } from 'react';
import { fetchAllListings, fetchAllProjects } from '../api';
import audit from '../../submission.json';
import { AlertTriangle, BarChart3, Building2, CheckCircle2, Clock3, Layers, RefreshCw, ShieldAlert, TrendingUp } from 'lucide-react';

const REFRESH_INTERVAL = 5 * 60 * 1000;

const propertyKey = (listing) => [listing.latitude, listing.longitude, listing.floor, listing.bedroom, listing.carpet_area].join('|');

const calculateInsights = (listings, projects) => {
    const uniqueProperties = new Set(listings.map(propertyKey));
    const activeListings = listings.filter((listing) => listing.is_live === true);
    const twoBedroom = listings.filter((listing) => listing.bedroom === 2 && listing.carpet_area > 0);
    const projectCounts = listings.reduce((counts, listing) => {
        if (listing.project_id) counts[listing.project_id] = (counts[listing.project_id] || 0) + 1;
        return counts;
    }, {});
    const projectsWithWrongCount = projects.filter((project) => project.total_listings !== undefined && project.total_listings !== (projectCounts[project.project_id] || 0)).length;
    const averagePricePerSqft = twoBedroom.length ? twoBedroom.reduce((total, listing) => total + listing.price / listing.carpet_area, 0) / twoBedroom.length : 0;
    return {
        totalListings: listings.length,
        uniqueProperties: uniqueProperties.size,
        activeListings: activeListings.length,
        duplicationFactor: uniqueProperties.size ? listings.length / uniqueProperties.size : 0,
        averagePricePerSqft,
        projectsWithWrongCount,
    };
};

export default function Insights() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const refresh = async () => {
        setLoading(true);
        setError('');
        try {
            const [listings, projects] = await Promise.all([fetchAllListings(), fetchAllProjects()]);
            setAnalytics(calculateInsights(listings, projects));
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Unable to refresh live insights.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        const interval = window.setInterval(refresh, REFRESH_INTERVAL);
        return () => window.clearInterval(interval);
    }, []);

    const metric = (liveValue) => loading ? '...' : (liveValue == null ? 'Unavailable' : formatNumber(liveValue));
    const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        <BarChart3 size={28} color="#2563eb" /> Market & Data Audit Insights
                    </h1>
                    <p style={styles.subtitle}>
                        Live platform metrics with findings from the API documentation audit.
                    </p>
                </div>
                <div style={styles.headerActions}>
                    <div style={styles.cityBadge}>City: New Delhi</div>
                    <button type="button" onClick={refresh} disabled={loading} style={styles.refreshButton}>
                        <RefreshCw size={16} /> {loading ? 'Refreshing' : 'Refresh'}
                    </button>
                </div>
            </header>

            <div style={styles.status}><span><Clock3 size={15} /> {lastUpdated ? `Live data: ${lastUpdated.toLocaleTimeString()}` : 'Loading live data...'}</span><span>Auto-refreshes every 5 minutes</span></div>
            {error && <p style={styles.error}>{error}</p>}

            {/* KPI Metric Cards */}
            <div style={styles.kpiGrid}>
                <div style={styles.kpiCard}>
                    <div style={styles.kpiHeader}>
                        <span style={styles.kpiLabel}>Total Listing Records</span>
                        <Layers size={20} color="#2563eb" />
                    </div>
                    <div style={styles.kpiValue}>
                        {metric(analytics?.totalListings)}
                    </div>
                    <p style={styles.kpiSub}>Retrieved via full API pagination</p>
                </div>

                <div style={styles.kpiCard}>
                    <div style={styles.kpiHeader}>
                        <span style={styles.kpiLabel}>Unique Physical Properties</span>
                        <Building2 size={20} color="#059669" />
                    </div>
                    <div style={styles.kpiValue}>
                        {metric(analytics?.uniqueProperties)}
                    </div>
                    <p style={styles.kpiSub}>Distinct real-world physical units</p>
                </div>

                <div style={styles.kpiCard}>
                    <div style={styles.kpiHeader}>
                        <span style={styles.kpiLabel}>Active Listings (is_live)</span>
                        <CheckCircle2 size={20} color="#16a34a" />
                    </div>
                    <div style={styles.kpiValue}>
                        {metric(analytics?.activeListings)}
                    </div>
                    <p style={styles.kpiSub}>{analytics ? `${Math.round((analytics.activeListings / analytics.totalListings) * 100)}% active` : 'Current live status mix'}</p>
                </div>

                <div style={styles.kpiCard}>
                    <div style={styles.kpiHeader}>
                        <span style={styles.kpiLabel}>Duplication Factor</span>
                        <AlertTriangle size={20} color="#d97706" />
                    </div>
                    <div style={styles.kpiValue}>{loading ? '...' : `${analytics?.duplicationFactor.toFixed(1)}x`}</div>
                    <p style={styles.kpiSub}>Listing records per physical property</p>
                </div>
            </div>

            <section style={styles.card}>
                <h3 style={styles.sectionTitle}>Live derived metrics</h3>
                <p>Average 2BHK price across all records: <strong>{loading ? '...' : analytics ? `₹${formatNumber(Math.round(analytics.averagePricePerSqft))} / sq ft` : 'Unavailable'}</strong></p>
                <p>Projects with mismatched listing counts: <strong>{metric(analytics?.projectsWithWrongCount)}</strong></p>
                <p style={styles.kpiSub}>These values are recalculated from the paginated API response whenever this page refreshes.</p>
                <p style={styles.snapshotNote}>Submission snapshot baseline: {formatNumber(audit.answers.total_listing_records)} records, {formatNumber(audit.answers.unique_properties)} physical properties, and {formatNumber(audit.answers.active_listings)} active listings. The live API can change independently.</p>
            </section>

            {/* Audit Discoveries (Documentation Discrepancies) */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    <ShieldAlert size={22} color="#dc2626" /> Critical API Documentation Discrepancies
                </h2>
                <div style={styles.findingsGrid}>{audit.findings.map((finding, index) => <div style={styles.findingCard} key={`${finding.endpoint}-${finding.category}-${index}`}>
                    <span style={styles.badgeAuth}>{finding.category}</span>
                    <h4>{finding.endpoint === '*' ? 'All endpoints' : finding.endpoint} discrepancy</h4>
                    <p><strong>Documented:</strong> {finding.documented}</p>
                    <p><strong>Actual:</strong> {finding.actual}</p>
                    <p><strong>Impact:</strong> {finding.impact}</p>
                </div>)}</div>
            </section>

            {/* Key Market Intelligence */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    <TrendingUp size={22} color="#2563eb" /> Market Intelligence & Benchmarks
                </h2>
                <div style={styles.card}>
                    <ul style={styles.list}>
                        <li>
                            <strong>City Inventory Focus:</strong> Live inventory and audit metrics are currently presented for New Delhi.
                        </li>
                        <li><strong>2BHK Price Valuation:</strong> Average price per square foot is recalculated from all 2BHK records, matching the submission formula.</li>
                        <li><strong>Inventory Integrity:</strong> Physical-property counts are derived from coordinates, floor, bedrooms, and carpet area.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}

const styles = {
    container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' },
    headerActions: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    refreshButton: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', background: '#2563eb', color: '#fff', border: 0, borderRadius: '6px', cursor: 'pointer' },
    status: { display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' },
    error: { color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '6px' },
    snapshotNote: { color: '#64748b', fontSize: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' },
    title: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 700, margin: 0 },
    subtitle: { color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.95rem' },
    cityBadge: { background: '#eff6ff', color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem', border: '1px solid #bfdbfe' },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' },
    kpiCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    kpiLabel: { fontSize: '0.85rem', fontWeight: 600, color: '#64748b' },
    kpiValue: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' },
    kpiSub: { fontSize: '0.75rem', color: '#94a3b8', margin: 0 },
    section: { marginBottom: '2rem' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' },
    card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    findingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' },
    findingCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem', position: 'relative' },
    badgeAuth: { background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' },
    badgeConsistency: { background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' },
    badgeCompleteness: { background: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' },
    list: { paddingLeft: '1.25rem', lineHeight: '1.8', margin: 0 }
};