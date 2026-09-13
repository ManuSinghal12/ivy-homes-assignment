import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchListing } from '../api';
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
export default function ListingDetail() {
  const { id } = useParams(); const [item, setItem] = useState(null); const [error, setError] = useState('');
  useEffect(() => { fetchListing(id).then(setItem).catch(e => setError(e.message)); }, [id]);
  if (error) return <main style={styles.main}><p>{error}</p><Link to="/">Back to listings</Link></main>;
  if (!item) return <main style={styles.main}>Loading listing…</main>;
  return <main style={styles.main}><Link to="/">← Back to listings</Link><article style={styles.card}>
    <span style={styles.status(item.is_live)}>{item.is_live ? 'Available' : 'Inactive'}</span><h1>{item.apartment_name}</h1><p>{item.locality} · {item.property_type}</p>
    <h2>{money(item.price)}</h2><p>{item.bedroom} BHK · {item.carpet_area?.toLocaleString('en-IN')} sq ft carpet area · {item.furnishing}</p><hr />
    <h3>About this home</h3><p>{item.description}</p><p><b>Floor:</b> {item.floor} of {item.total_floors} &nbsp; <b>Facing:</b> {item.facing_direction}</p><p><b>Listed by:</b> {item.posted_by_name} ({item.posted_by})</p>
  </article></main>;
}
const styles = { main:{maxWidth:900,margin:'0 auto',padding:'2rem'},card:{marginTop:'1rem',background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'2rem'},status:(live)=>({background:live?'#dcfce7':'#fee2e2',color:live?'#166534':'#991b1b',padding:'4px 8px',borderRadius:99,fontSize:13}) };
