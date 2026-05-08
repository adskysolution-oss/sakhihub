'use client';

import React from 'react';
import { 
  X, User, Phone, MapPin, Calendar, 
  Heart, Briefcase, Users, ShieldCheck, 
  Clock, IndianRupee, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberDetailsModalProps {
  member: any;
  onClose: () => void;
}

export default function MemberDetailsModal({ member, onClose }: MemberDetailsModalProps) {
  if (!member) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ 
          background: 'white', 
          width: '100%', 
          maxWidth: '800px', 
          borderRadius: '40px', 
          maxHeight: '90vh', 
          overflow: 'hidden',
          boxShadow: '0 30px 100px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
      >
        {/* Header Section */}
        <div style={{ background: 'var(--grad-primary)', padding: '60px 40px 40px', position: 'relative', color: 'white' }}>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', right: '25px', top: '25px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              {member.name[0]}
            </div>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>{member.name}</h2>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 15px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} /> {member.groupId?.groupName || 'No Group'}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 15px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> {member.village}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '40px', overflowY: 'auto', maxHeight: 'calc(90vh - 200px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            {/* Left Column: Profile Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <SectionTitle icon={User} title="Personal Information" />
              
              <InfoGrid>
                <InfoItem label="Full Name" value={member.name} />
                <InfoItem label="Mobile" value={member.mobile} />
                <InfoItem label="Age" value={`${member.age} Years`} />
                <InfoItem label="Marital Status" value={member.maritalStatus} />
                <InfoItem label="Occupation" value={member.occupation} />
              </InfoGrid>

              <div style={{ marginTop: '10px' }}>
                <SectionTitle icon={Heart} title="Interests" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                  {member.interests?.map((interest: string, i: number) => (
                    <span key={i} style={{ background: '#f5f3ff', color: '#6a1b9a', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700' }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Location & Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <SectionTitle icon={MapPin} title="Geography" />
              <InfoGrid>
                <InfoItem label="Village" value={member.village} />
                <InfoItem label="Block" value={member.block} />
                <InfoItem label="District" value={member.district} />
              </InfoGrid>

              <div style={{ marginTop: '10px' }}>
                <SectionTitle icon={ShieldCheck} title="Membership Status" />
                <div style={{ background: member.membershipStatus === 'paid' ? '#f0fdf4' : '#fffbeb', padding: '25px', borderRadius: '25px', marginTop: '15px', border: `1px solid ${member.membershipStatus === 'paid' ? '#10b981' : '#f59e0b'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: member.membershipStatus === 'paid' ? '#16a34a' : '#d97706', fontWeight: '800', textTransform: 'uppercase' }}>Status</p>
                      <h4 style={{ margin: '5px 0', fontSize: '1.4rem', fontWeight: '900', color: member.membershipStatus === 'paid' ? '#16a34a' : '#d97706' }}>
                        {member.membershipStatus === 'paid' ? 'Verified Member' : 'Pending Verification'}
                      </h4>
                    </div>
                    {member.membershipStatus === 'paid' ? <CheckCircle2 size={32} color="#16a34a" /> : <Clock size={32} color="#d97706" />}
                  </div>
                  <p style={{ margin: '15px 0 0', fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
                    {member.membershipStatus === 'paid' 
                      ? 'The member has completed the registration and paid the required fee.' 
                      : 'Initial registration is complete. Please collect the ₹100 membership fee to activate.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#888' }}>
                  <Calendar size={14} /> Joined on {new Date(member.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#888' }}>
                  <Users size={14} /> Created By: {member.createdBy?.fullName || 'Self'}
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <SectionTitle icon={IndianRupee} title="Payment History" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '15px', borderRadius: '15px', background: '#f8f9fa' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800' }}>Membership Fee</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>Standard Registration</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: member.membershipStatus === 'paid' ? '#10b981' : '#666' }}>₹100.00</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: member.membershipStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                      {member.membershipStatus === 'paid' ? 'PAID' : 'PENDING'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)', fontWeight: '900', fontSize: '1.1rem' }}>
      <Icon size={20} color="var(--primary)" /> {title}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>{children}</div>;
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '5px 0 0', fontSize: '1rem', fontWeight: '700', color: '#333' }}>{value || 'N/A'}</p>
    </div>
  );
}
