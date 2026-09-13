import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchListing, getCurrentUser } from '../api';
const key = () => `ivy_favs_${getCurrentUser()?.email || 'guest'}`;
export default function Favourites() {
  const [ids, setIds] = useState(() => JSON.parse(localStorage.getItem(key()) || '[]')); const [items, setItems] = useState([]);
  useEffect(() => { Promise.all(ids.map(id => fetchListing(id).catch(() => null))).then(results => setItems(results.filter(Boolean))); }, [ids]);
  const remove = (id) => { const next=ids.filter(x=>x!==id); setIds(next); localStorage.setItem(key(),JSON.stringify(next)); };
  return <main style={{padding:'2rem',maxWidth:1100,margin:'auto'}}><h1>Saved homes</h1>{!ids.length ? <p>No saved listings yet. <Link to="/">Browse homes</Link></p> : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:16}}>{items.map(item=><article key={item.listing_id} style={{border:'1px solid #e2e8f0',padding:16,borderRadius:10}}><h3>{item.apartment_name}</h3><p>{item.locality}</p><strong>₹{item.price?.toLocaleString('en-IN')}</strong><p><Link to={`/listings/${encodeURIComponent(item.listing_id)}`}>View details</Link> · <button onClick={()=>remove(item.listing_id)}>Remove</button></p></article>)}</div>}</main>;
}
