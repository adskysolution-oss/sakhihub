import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, ClipboardList, Camera, Video, AlertCircle, RefreshCw, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

interface CreateMeetingModalProps {
  groupId: string;
  groupName: string;
  members: any[];
  meetingToEdit?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMeetingModal({ groupId, groupName, members, meetingToEdit, onClose, onSuccess }: CreateMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'form' | 'uploading_media' | 'finalizing'>('form');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, type: '' });
  
  // GPS Location State
  const [gpsLocation, setGpsLocation] = useState<{ latitude?: number; longitude?: number }>({});
  
  // Form Fields (Pre-populated if editing)
  const [meetingDate, setMeetingDate] = useState(
    meetingToEdit?.meetingDate 
      ? new Date(meetingToEdit.meetingDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState(meetingToEdit?.remarks || '');
  const [village, setVillage] = useState(meetingToEdit?.village || '');
  const [block, setBlock] = useState(meetingToEdit?.block || '');
  const [district, setDistrict] = useState(meetingToEdit?.district || '');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(
    meetingToEdit?.attendees 
      ? meetingToEdit.attendees.map((a: any) => a._id || a.toString()) 
      : []
  );
  
  // Media Files State
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ file: File; duration?: number }[]>([]);
  const [error, setError] = useState('');

  // 1. Initial GPS location capture and location pre-filling
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('GPS permission denied or unavailable:', err);
        }
      );
    }

    // Prefill from first member's location details if not editing
    if (!meetingToEdit && members.length > 0) {
      const first = members[0];
      setVillage(first.village || '');
      setBlock(first.block || '');
      setDistrict(first.district || '');
    }
  }, [members, meetingToEdit]);

  // Handle Photo files selection (max 20)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (photoFiles.length + files.length > 20) {
        toast.error('Maximum 20 photos are allowed per meeting');
        return;
      }
      setPhotoFiles(prev => [...prev, ...files]);
    }
  };

  // Handle Video file selection & check duration & size
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (videoFiles.length + files.length > 3) {
        toast.error('Maximum 3 videos are allowed per meeting');
        return;
      }

      for (const file of files) {
        // Enforce 30MB limit
        if (file.size > 30 * 1024 * 1024) {
          toast.error(`Video "${file.name}" exceeds the 30MB size limit`);
          continue;
        }

        try {
          // Read video duration metadata on frontend
          const duration = await new Promise<number>((resolve) => {
            const videoEl = document.createElement('video');
            videoEl.preload = 'metadata';
            videoEl.src = URL.createObjectURL(file);
            videoEl.onloadedmetadata = () => {
              window.URL.revokeObjectURL(videoEl.src);
              resolve(videoEl.duration);
            };
          });

          // Enforce 2-minute duration limit
          if (duration > 120) {
            toast.error(`Video "${file.name}" exceeds the 2-minute duration limit (${Math.round(duration)}s)`);
            continue;
          }

          setVideoFiles(prev => [...prev, { file, duration }]);
        } catch (err) {
          console.error('Failed to read video metadata:', err);
          toast.error(`Failed to read video metadata for "${file.name}"`);
        }
      }
    }
  };

  const toggleAttendee = (memberId: string) => {
    setSelectedAttendees(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const selectAllAttendees = () => {
    if (selectedAttendees.length === members.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(members.map(m => m._id));
    }
  };

  // Convert File to Base64 String
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
    });
  };

  // Compress Photo to WebP using browser-image-compression
  const compressPhoto = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.7, // Target size: 300KB - 700KB
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/webp'
    };
    try {
      return await imageCompression(file, options);
    } catch (err) {
      console.error('Frontend compression failed, uploading original:', err);
      return file;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAttendees.length === 0) {
      setError('Please select at least one attending member');
      return;
    }

    setLoading(true);
    setError('');

    let meetingId = '';

    try {
      if (meetingToEdit) {
        // Step 1 for Edits: Call PUT to update details
        setUploadStep('finalizing');
        const updateRes = await axios.put(`/api/meetings/${meetingToEdit._id}`, {
          meetingDate,
          remarks,
          village,
          block,
          district,
          attendees: selectedAttendees
        });

        if (!updateRes.data.success) {
          throw new Error(updateRes.data.message || 'Failed to update meeting details');
        }

        meetingId = meetingToEdit._id;
      } else {
        // Step 1 for New Meetings: Create GroupMeeting Record in 'draft' status
        setUploadStep('uploading_media');
        setUploadProgress({ current: 0, total: photoFiles.length + videoFiles.length, type: 'Creating meeting record...' });

        const createRes = await axios.post('/api/meetings', {
          groupId,
          meetingDate,
          remarks,
          village,
          block,
          district,
          attendees: selectedAttendees
        });

        if (!createRes.data.success) {
          throw new Error(createRes.data.message || 'Failed to create meeting draft');
        }

        meetingId = createRes.data.data._id;
      }

      let uploadCount = 0;
      if (photoFiles.length + videoFiles.length > 0) {
        setUploadStep('uploading_media');
      }

      // Step 2: Compress and upload photos sequentially
      for (let i = 0; i < photoFiles.length; i++) {
        uploadCount++;
        setUploadProgress({
          current: uploadCount,
          total: photoFiles.length + videoFiles.length,
          type: `Compressing & Uploading Photo ${i + 1} of ${photoFiles.length}...`
        });

        const originalFile = photoFiles[i];
        const compressedFile = await compressPhoto(originalFile);
        const base64Str = await fileToBase64(compressedFile);

        // Upload to S3 via general upload endpoint
        const uploadRes = await axios.post('/api/upload', {
          image: base64Str,
          folder: `groups/${groupId}/meetings/${meetingId}/photos`,
          originalName: originalFile.name
        });

        if (!uploadRes.data.success) {
          throw new Error(`Failed to upload photo: ${originalFile.name}`);
        }

        const { url, bytes } = uploadRes.data.data;

        // Attach media url and metadata to meeting media collection
        await axios.post(`/api/meetings/${meetingId}/media`, {
          type: 'photo',
          url,
          size: bytes,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          capturedAt: new Date()
        });
      }

      // Step 3: Compress and upload videos sequentially
      for (let i = 0; i < videoFiles.length; i++) {
        uploadCount++;
        setUploadProgress({
          current: uploadCount,
          total: photoFiles.length + videoFiles.length,
          type: `Uploading & Compressing Video ${i + 1} of ${videoFiles.length} (FFmpeg rendering)...`
        });

        const { file: videoFile, duration } = videoFiles[i];
        const fd = new FormData();
        fd.append('file', videoFile);
        fd.append('groupId', groupId);
        fd.append('meetingId', meetingId);
        if (duration !== undefined) {
          fd.append('duration', String(duration));
        }

        // Upload to dedicated video multipart endpoint
        const uploadRes = await axios.post('/api/upload/video', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (!uploadRes.data.success) {
          throw new Error(`Failed to upload/compress video: ${videoFile.name}`);
        }

        const { url, size } = uploadRes.data.data;

        // Attach media url and duration metadata to meeting media collection
        await axios.post(`/api/meetings/${meetingId}/media`, {
          type: 'video',
          url,
          size,
          duration,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          capturedAt: new Date()
        });
      }

      // Step 4: Finalize and submit meeting record
      setUploadStep('finalizing');
      const submitRes = await axios.patch(`/api/meetings/${meetingId}`, {
        status: 'submitted'
      });

      if (!submitRes.data.success) {
        throw new Error(submitRes.data.message || 'Failed to submit meeting for verification');
      }

      toast.success('Meeting recorded and media evidence submitted successfully!');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please check your network.');
      setUploadStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }} />
      
      <div style={{ position: 'relative', background: 'white', width: '100%', maxWidth: '800px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        
        {/* Header */}
        <div style={{ background: 'var(--grad-primary)', padding: '25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>Record Group Meeting</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Unit: {groupName}</p>
          </div>
          {!loading && (
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {uploadStep === 'form' ? (
          <form onSubmit={handleSubmit} style={{ padding: '30px', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Meeting Date</label>
                <input required type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontWeight: '700', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Village / Location</label>
                <input required type="text" value={village} onChange={e => setVillage(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontWeight: '700', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Block</label>
                <input required type="text" value={block} onChange={e => setBlock(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontWeight: '700', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>District</label>
                <input required type="text" value={district} onChange={e => setDistrict(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontWeight: '700', outline: 'none' }} />
              </div>
            </div>

            {/* Attendance checklist */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--secondary)' }}>Mark Attendees Checklist ({selectedAttendees.length} Attending)</label>
                <button type="button" onClick={selectAllAttendees} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  {selectedAttendees.length === members.length ? 'Deselect All' : 'Select All Members'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', maxHeight: '150px', overflowY: 'auto', padding: '15px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                {members.map(m => (
                  <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'white', border: selectedAttendees.includes(m._id) ? '1px solid var(--primary)' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                    <input type="checkbox" checked={selectedAttendees.includes(m._id)} onChange={() => toggleAttendee(m._id)} style={{ accentColor: 'var(--primary)' }} />
                    <span style={{ color: 'var(--secondary)' }}>{m.name}</span>
                  </label>
                ))}
                {members.length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center' }}>No members registered in this group yet.</p>}
              </div>
            </div>

            {/* Geolocation visual check */}
            <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: gpsLocation.latitude ? '#f0fdf4' : '#fffbeb', borderRadius: '12px', border: gpsLocation.latitude ? '1px solid #bbf7d0' : '1px solid #fef3c7', fontSize: '0.75rem', fontWeight: '800', color: gpsLocation.latitude ? '#15803d' : '#b45309' }}>
              <MapPin size={16} />
              {gpsLocation.latitude ? (
                <span>GPS Location Captured: ({gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude?.toFixed(5)})</span>
              ) : (
                <span>Capturing GPS location... Please ensure location permissions are enabled.</span>
              )}
            </div>

            {/* Upload media fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div style={{ padding: '20px', background: '#fcfcfc', border: '2px dashed #e2e8f0', borderRadius: '20px', textAlign: 'center' }}>
                <Camera size={28} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 5px', fontWeight: '800', fontSize: '0.9rem' }}>Evidence Photos (Max 20)</h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.7rem', color: '#888' }}>Allowed: JPG, PNG, WEBP. Compresses locally.</p>
                <input type="file" multiple accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} id="photo-file-input" />
                <button type="button" onClick={() => document.getElementById('photo-file-input')?.click()} style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Choose Photos</button>
                {photoFiles.length > 0 && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800', marginTop: '10px' }}>{photoFiles.length} files selected</p>}
              </div>

              <div style={{ padding: '20px', background: '#fcfcfc', border: '2px dashed #e2e8f0', borderRadius: '20px', textAlign: 'center' }}>
                <Video size={28} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 5px', fontWeight: '800', fontSize: '0.9rem' }}>Evidence Videos (Max 3)</h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.7rem', color: '#888' }}>Max 30MB & 2 minutes duration per video.</p>
                <input type="file" multiple accept="video/*" onChange={handleVideoChange} style={{ display: 'none' }} id="video-file-input" />
                <button type="button" onClick={() => document.getElementById('video-file-input')?.click()} style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Choose Videos</button>
                {videoFiles.length > 0 && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800', marginTop: '10px' }}>{videoFiles.length} videos selected</p>}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Meeting Observations & Remarks</label>
              <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks, guidelines discussed, or village feedback..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontWeight: '700', outline: 'none', resize: 'none' }}></textarea>
            </div>

            {error && (
              <div style={{ padding: '12px 15px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={18} /> Submit Meeting Evidence
              </button>
            </div>
          </form>
        ) : (
          /* Loading & Uploading pipeline display screen */
          <div style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {uploadStep === 'uploading_media' ? (
              <>
                <RefreshCw size={50} className="animate-spin text-primary" style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', margin: 0 }}>Uploading Evidence Media Files</h3>
                <p style={{ color: '#666', fontWeight: '700', fontSize: '0.95rem' }}>{uploadProgress.type}</p>
                <div style={{ width: '100%', maxWidth: '300px', height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: `${(uploadProgress.current / (uploadProgress.total || 1)) * 100}%`, height: '100%', background: 'var(--grad-primary)', borderRadius: '10px', transition: 'width 0.4s' }}></div>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8' }}>Processed {uploadProgress.current} of {uploadProgress.total} Files</span>
              </>
            ) : (
              <>
                <Check size={50} style={{ color: '#10b981', padding: '10px', background: '#ecfdf5', borderRadius: '50%' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', margin: 0 }}>Finalizing Submission</h3>
                <p style={{ color: '#666', fontWeight: '700', fontSize: '0.95rem' }}>Registering parameters and submitting to verifier pipeline...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
