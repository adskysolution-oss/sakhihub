'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Plus, ClipboardCheck, ArrowLeft, Send, CheckCircle, AlertCircle, MapPin, Users, Calendar, Upload, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function EmployeeReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Form states
  const [village, setVillage] = useState('');
  const [meetingCount, setMeetingCount] = useState('0');
  const [groupsFormed, setGroupsFormed] = useState('0');
  const [membersAdded, setMembersAdded] = useState('0');
  const [photos, setPhotos] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchStatusAndReports = async () => {
    try {
      setAttendanceLoading(true);
      const attRes = await axios.get('/api/hrms/attendance/check-in');
      if (attRes.data.success && attRes.data.data.attendance) {
        setIsCheckedIn(true);
      } else {
        setIsCheckedIn(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }

    try {
      setLoading(true);
      const repRes = await axios.get('/api/hrms/reports');
      if (repRes.data.success) {
        setReports(repRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load daily reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndReports();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const res = await axios.post('/api/upload', {
            image: base64String,
            folder: 'field_reports'
          });

          if (res.data.success) {
            setPhotos(prev => [...prev, res.data.data.url]);
            toast.success('Photo uploaded successfully!');
          }
        } catch (err) {
          toast.error('Failed to upload photo.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCheckedIn) {
      toast.error('You must check-in first before submitting a report.');
      return;
    }
    if (!village) {
      toast.error('Village name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/hrms/reports', {
        village,
        meetingCount: parseInt(meetingCount) || 0,
        groupsFormed: parseInt(groupsFormed) || 0,
        membersAdded: parseInt(membersAdded) || 0,
        photos,
        remarks
      });

      if (res.data.success) {
        toast.success('Report submitted successfully!');
        setVillage('');
        setMeetingCount('0');
        setGroupsFormed('0');
        setMembersAdded('0');
        setPhotos([]);
        setRemarks('');
        setShowForm(false);
        fetchStatusAndReports();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit field report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Daily Field Reports</h2>
            <p style={{ color: '#888' }}>Log meetings, group formation, and member registrations from the field.</p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                if (!isCheckedIn) {
                  toast.error('Submission Gated: You must check-in today before submitting a report.');
                } else {
                  setShowForm(true);
                }
              }}
              className="btn-primary"
              style={{ gap: '8px', opacity: isCheckedIn ? 1 : 0.6 }}
            >
              <Plus size={20} /> Submit New Report
            </button>
          )}
        </div>

        {/* Warning Alert if Not Checked In */}
        {!isCheckedIn && !attendanceLoading && (
          <div style={{ padding: '20px', background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px', color: '#e65100' }}>
            <AlertCircle size={24} />
            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>
              Attendance Gating Rule: You are currently not Checked-In today. You must capture your check-in selfie and GPS coordinates on the Attendance page before report submissions are allowed.
            </span>
          </div>
        )}

        {/* Report Submission Form */}
        {showForm && (
          <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>New Daily Field Report</h3>
              <button onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                <ArrowLeft size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="max-md:grid-cols-1">
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Village Name *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Enter village name"
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Meetings Conducted</label>
                <input
                  type="number"
                  min="0"
                  value={meetingCount}
                  onChange={(e) => setMeetingCount(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Groups Formed</label>
                <input
                  type="number"
                  min="0"
                  value={groupsFormed}
                  onChange={(e) => setGroupsFormed(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Members Added</label>
                <input
                  type="number"
                  min="0"
                  value={membersAdded}
                  onChange={(e) => setMembersAdded(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }} className="max-md:col-span-1">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Evidence Photos</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  {photos.map((photoUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #eee' }}>
                      <img src={photoUrl} alt="Report evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removePhoto(idx)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>×</button>
                    </div>
                  ))}
                  <div style={{ position: 'relative', width: '90px', height: '90px', border: '1.5px dashed #bbb', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa' }}>
                    <input
                      type="file"
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                    <Upload size={18} color="#999" />
                    <span style={{ fontSize: '9px', color: '#999', marginTop: '5px' }}>{uploading ? 'Uploading...' : 'Add Photo'}</span>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }} className="max-md:col-span-1">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Field Remarks</label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Summarize challenges faced or highlight key outcomes..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', justifyContent: 'flex-end' }} className="max-md:col-span-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '12px 25px' }}>Cancel</button>
                <button type="submit" disabled={submitting || uploading} className="btn-primary" style={{ padding: '12px 30px', gap: '8px' }}>
                  <Send size={16} /> {submitting ? 'Submitting...' : 'Send Report'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reports History */}
        <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px' }}>Field Submission History</h3>

          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <ClipboardCheck size={48} style={{ color: '#eee', marginBottom: '15px' }} />
              <p style={{ fontStyle: 'italic' }}>No daily reports submitted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {reports.map((report) => (
                <div key={report._id} style={{ padding: '20px', background: '#fafafa', borderRadius: '24px', border: '1px solid #eee' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', gap: '20px', alignItems: 'center' }} className="max-md:grid-cols-1">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '45px', height: '45px', background: 'rgba(233,30,99,0.1)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={22} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}>
                          {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={10} /> {report.village}, {report.block}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#888' }}>Meetings</p>
                        <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '2px' }}>{report.meetingCount}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#888' }}>Groups Formed</p>
                        <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '2px' }}>{report.groupsFormed}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#888' }}>Members Added</p>
                        <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '2px' }}>{report.membersAdded}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }} className="max-md:justify-start">
                      {report.photos?.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {report.photos.slice(0, 2).map((url: string, idx: number) => (
                            <img key={idx} src={url} alt="Evidence preview" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {report.remarks && (
                    <p style={{ fontSize: '0.8rem', color: '#666', borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '10px', fontStyle: 'italic' }}>
                      <strong>Remarks:</strong> {report.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
