'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, MapPin, Calendar, CheckCircle } from 'lucide-react';

const campaigns = [
  { id: 1, title: 'Health Drive Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', status: 'Completed', img: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800' },
  { id: 2, title: 'Menstrual Dignity Patna', state: 'Bihar', district: 'Patna', status: 'Completed', img: 'https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=800' },
  { id: 3, title: 'Rural Outreach Gaya', state: 'Bihar', district: 'Gaya', status: 'Upcoming', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800' },
  { id: 4, title: 'Hygiene Camp Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', status: 'Upcoming', img: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=800' },
  { id: 5, title: 'Awareness Ranchi', state: 'Jharkhand', district: 'Ranchi', status: 'Completed', img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800' },
];

export default function CampaignGallery() {
  const [filter, setFilter] = useState({ status: 'All', state: 'All' });

  const states = ['All', ...Array.from(new Set(campaigns.map(c => c.state)))];
  
  const filtered = campaigns.filter(c => {
    return (filter.status === 'All' || c.status === filter.status) &&
           (filter.state === 'All' || c.state === filter.state);
  });

  return (
    <div style={{ padding: '60px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} color="var(--primary)" />
          <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #eee' }}>
            <option value="All">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <select value={filter.state} onChange={e => setFilter({...filter, state: e.target.value})} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #eee' }}>
          {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
        </select>
      </div>

      <motion.div layout className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        <AnimatePresence>
          {filtered.map((camp) => (
            <motion.div
              layout
              key={camp.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f2f2f2' }}
            >
              <div style={{ height: '200px', position: 'relative' }}>
                <img src={camp.img} alt={camp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: camp.status === 'Completed' ? '#e1ffeb' : '#fff5f8', color: camp.status === 'Completed' ? '#25d366' : 'var(--primary)', padding: '5px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>
                  {camp.status}
                </div>
              </div>
              <div style={{ padding: '25px' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>{camp.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.85rem' }}>
                    <MapPin size={14} color="var(--primary)" /> {camp.district}, {camp.state}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.85rem' }}>
                    <Calendar size={14} color="var(--primary)" /> {camp.status === 'Completed' ? 'Finished last month' : 'Coming soon'}
                  </div>
                </div>
                {camp.status === 'Upcoming' && (
                  <button className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.9rem', borderRadius: '10px' }}>Join as Volunteer</button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
