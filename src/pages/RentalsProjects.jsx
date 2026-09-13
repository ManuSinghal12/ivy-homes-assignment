import React, { useEffect, useState } from 'react';
import { fetchProjects, fetchRentals } from '../api';
const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const crore = n => `₹${Number(n || 0).toFixed(2)} Cr`;
function Pager({ load, more, loading }) { return !loading && more ? <button style={{margin:'20px auto',display:'block'}} onClick={load}>Load more</button> : loading ? <p>Loading…</p> : null; }
export default function RentalsProjects() {
  const [rentals,setRentals]=useState([]),[projects,setProjects]=useState([]),[rOffset,setROffset]=useState(0),[pOffset,setPOffset]=useState(0),[rMore,setRMore]=useState(true),[pMore,setPMore]=useState(true),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const loadRentals=async(offset=0)=>{try { const d=await fetchRentals(offset,20); setRentals(x=>offset?[...x,...d.results]:d.results);setROffset(offset+d.count);setRMore(d.has_more); } catch(e){setError(e.message)} };
  const loadProjects=async(offset=0)=>{try { const d=await fetchProjects(offset,20); setProjects(x=>offset?[...x,...d.results]:d.results);setPOffset(offset+d.count);setPMore(d.has_more); } catch(e){setError(e.message)} };
  useEffect(()=>{Promise.all([loadRentals(),loadProjects()]).finally(()=>setLoading(false));},[]);
  return <main style={{padding:'2rem',maxWidth:1300,margin:'auto'}}><h1>Rentals & projects</h1>{error&&<p style={{color:'#b91c1c'}}>{error}</p>}<h2>Homes for rent</h2><div style={styles.grid}>{rentals.map(r=><article key={r.listing_id} style={styles.card}><h3>{r.apartment_name}</h3><p>{r.locality} · {r.bedroom} BHK · {r.furnishing}</p><strong>{money(r.price)} / month</strong><p>{r.carpet_area?.toLocaleString('en-IN')} sq ft · Deposit {money(r.deposit)}</p></article>)}</div><Pager loading={loading} more={rMore} load={()=>loadRentals(rOffset)}/>
  <h2>Builder projects</h2><p>Project API prices are expressed in crores and are labelled accordingly.</p><div style={styles.grid}>{projects.map(p=><article key={p.project_id} style={styles.card}><h3>{p.apartment_name}</h3><p>{p.developer_name} · {p.locality}</p><p>{p.min_area_sqft?.toLocaleString('en-IN')}–{p.max_area_sqft?.toLocaleString('en-IN')} sq ft</p><strong>{crore(p.price_min)} – {crore(p.price_max)}</strong></article>)}</div><Pager loading={loading} more={pMore} load={()=>loadProjects(pOffset)}/></main>;
}
const styles={grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:16},card:{border:'1px solid #e2e8f0',borderRadius:10,padding:16,background:'#fff'}};
