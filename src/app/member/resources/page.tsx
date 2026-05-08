'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Heart, Download, FileText, Image as ImageIcon, 
  Video, Link as LinkIcon, MessageSquare, 
  HelpCircle, ExternalLink, Sparkles
} from "lucide-react";

const resources = [
  { 
    title: "Health & Hygiene Guide", 
    desc: "A complete guide on menstrual health and hygiene for women.",
    icon: <Heart size={24} />,
    type: "PDF",
    size: "2.4 MB"
  },
  { 
    title: "Sakhi Care Kit Manual", 
    desc: "Instructions on how to use and dispose of Sakhi Care sanitary pads.",
    icon: <Sparkles size={24} />,
    type: "Document",
    size: "1.1 MB"
  },
  { 
    title: "Membership Benefits", 
    desc: "Overview of all the perks and support you get as a verified member.",
    icon: <FileText size={24} />,
    type: "PDF",
    size: "800 KB"
  }
];

const videos = [
  { title: "Introduction to SakhiHub", duration: "3:45", thumbnail: "/images/programs_health.png" },
  { title: "Success Stories: Rural Empowerment", duration: "5:20", thumbnail: "/images/programs_employment.png" }
];

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Header */}
        <section style={{ marginBottom: '10px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>Member Resources</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Access training materials, health guides, and community support documents.</p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
          {/* Documents Section */}
          <section className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '30px', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} color="var(--primary)" /> Learning Materials
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {resources.map((res, i) => (
                <div key={i} style={{ 
                  padding: '25px', 
                  background: '#f8f9fa', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  border: '1px solid transparent',
                  transition: '0.2s',
                  cursor: 'pointer'
                }} className="res-card">
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      {res.icon}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '800', color: 'var(--secondary)', marginBottom: '4px' }}>{res.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4', maxWidth: '350px' }}>{res.desc}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#999', display: 'block', marginBottom: '8px' }}>{res.type} • {res.size}</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <Download size={16} /> Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Videos & Support */}
          <aside style={{ display: 'grid', gap: '30px' }}>
            <section style={{ background: 'white', padding: '30px', borderRadius: '30px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '20px' }}>Video Gallery</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {videos.map((vid, i) => (
                  <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ height: '120px', background: '#eee' }}>
                       <img src={vid.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={vid.title} />
                    </div>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ borderLeft: '10px solid var(--primary)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: '3px' }}></div>
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: 'white' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: 0 }}>{vid.title}</h4>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>{vid.duration} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: '#FFF5F8', padding: '30px', borderRadius: '30px', border: '1px solid #FCE7F3' }}>
              <HelpCircle size={24} color="var(--primary)" style={{ marginBottom: '15px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>Need Help?</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>Our support team and Field Heroes are here to assist you with any questions.</p>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <MessageSquare size={18} /> Contact Support
              </button>
            </section>
          </aside>
        </div>
      </div>
      <style jsx>{`
        .res-card:hover { border-color: var(--primary) !important; background: #fffcfd !important; }
      `}</style>
    </DashboardLayout>
  );
}
