'use client';

import React from 'react';
import { X } from 'lucide-react';
import AddMemberForm from './AddMemberForm';

interface AddMemberModalProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ groupId, groupName, onClose, onSuccess }: AddMemberModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'relative', background: 'white', width: '100%', maxWidth: '750px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', padding: '25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>
              Add New Member
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
              Registering to group: {groupName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
          <AddMemberForm onCancel={onClose} onSuccess={onSuccess} defaultGroupId={groupId} />
        </div>
      </div>
    </div>
  );
}
