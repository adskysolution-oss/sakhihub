'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Camera, MapPin, CheckCircle, AlertTriangle, Clock, History, UserCheck, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function EmployeeAttendancePage() {
  const [hrmsEnabled, setHrmsEnabled] = useState<boolean | null>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Camera states
  const [streamActive, setStreamActive] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Safely bind video stream when ref mounts in the DOM
  useEffect(() => {
    if (streamActive && activeStream && videoRef.current) {
      videoRef.current.srcObject = activeStream;
    }
  }, [streamActive, activeStream]);

  // Clean up camera stream tracks on unmount or stream change
  useEffect(() => {
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeStream]);

  // Geolocation states
  const [location, setLocation] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch status and history
  const fetchData = async () => {
    setLoading(true);
    try {
      const statusRes = await axios.get('/api/hrms/attendance/check-in');
      if (statusRes.data.success) {
        setHrmsEnabled(statusRes.data.data.hrmsEnabled);
        setAttendance(statusRes.data.data.attendance);
      }

      const historyRes = await axios.get('/api/hrms/attendance');
      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load attendance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Request GPS Location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;
        let address = 'Determining address...';

        try {
          // OpenStreetMap Reverse Geocoding (free lookup)
          const geoRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          address = geoRes.data?.display_name || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
        } catch (e) {
          address = `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;
        }

        setLocation({
          latitude,
          longitude,
          accuracy,
          address,
          locationTimestamp: new Date(timestamp)
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        setLocationError('Failed to capture GPS. Please enable location permissions.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCapturedPhoto(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 }
      });
      setActiveStream(stream);
      setStreamActive(true);
    } catch (err) {
      console.error(err);
      toast.error('Could not access camera. Please allow camera access.');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
    setStreamActive(false);
  };

  // Capture Frame
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Flip horizontally to simulate mirror
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  // Trigger Check-In
  const handleCheckIn = async () => {
    if (!capturedPhoto) {
      toast.error('Please capture a selfie first.');
      return;
    }
    if (!location) {
      toast.error('Please capture your GPS location.');
      return;
    }

    setActionLoading(true);
    try {
      // 1. Upload Selfie Photo
      const uploadRes = await axios.post('/api/upload', {
        image: capturedPhoto,
        folder: 'attendance_selfies'
      });

      if (!uploadRes.data.success) {
        throw new Error('Selfie photo upload failed.');
      }

      const photoUrl = uploadRes.data.data.url;

      // 2. Submit Check-In
      const checkInRes = await axios.post('/api/hrms/attendance/check-in', {
        photoUrl,
        location,
        deviceInfo: navigator.userAgent
      });

      if (checkInRes.data.success) {
        toast.success('Check-In successful!');
        setCapturedPhoto(null);
        setLocation(null);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Check-In failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Check-Out
  const handleCheckOut = async () => {
    if (!location) {
      toast.error('Please capture your GPS location for check-out.');
      return;
    }

    setActionLoading(true);
    try {
      const checkOutRes = await axios.post('/api/hrms/attendance/check-out', {
        location
      });

      if (checkOutRes.data.success) {
        toast.success('Check-Out successful!');
        setLocation(null);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-Out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p style={{ marginTop: '15px', color: '#666', fontWeight: 'bold' }}>Loading attendance panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (hrmsEnabled === false) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', padding: '40px' }} className="glass-card">
          <Shield size={64} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)' }}>HRMS Access Disabled</h2>
          <p style={{ color: '#888', maxWidth: '400px', marginTop: '10px' }}>
            HRMS portal features are currently not enabled for your account. Please ask your administrator to activate your HRMS access flag.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Daily Geotagged Attendance</h2>
          <p style={{ color: '#888' }}>Capture daily check-in selfie and GPS coordinates to verify field activity.</p>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'flex-start' }} className="max-md:grid-cols-1">
          {/* Main Check-In/Out Panel */}
          <div style={{ padding: '30px', background: 'white', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f5f5f5' }}>
            {!attendance ? (
              // CHECK IN VIEW
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)' }}>Check-In Portal</h3>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>You must log your check-in selfie and capture your current location to enable report submissions.</p>

                {/* Webcam Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fafafa', borderRadius: '24px', padding: '20px', position: 'relative', border: '1px dashed #ddd', minHeight: '300px', justifyContent: 'center' }}>
                  {capturedPhoto ? (
                    <img src={capturedPhoto} alt="Selfie preview" style={{ width: '280px', height: '280px', borderRadius: '20px', objectFit: 'cover' }} />
                  ) : streamActive ? (
                    <div style={{ position: 'relative', width: '280px', height: '280px', borderRadius: '20px', overflow: 'hidden' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}></video>
                      <button onClick={capturePhoto} className="btn-primary" style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', padding: '8px 20px', fontSize: '0.8rem' }}>Take Snapshot</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'rgba(233,30,99,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={32} />
                      </div>
                      <button onClick={startCamera} className="btn-secondary" style={{ padding: '10px 25px' }}>Start Camera</button>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>

                {/* Geolocation Capture */}
                <div style={{ padding: '20px', background: '#fcfcfc', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} color="var(--primary)" /> Capture GPS Position</span>
                    <button disabled={locationLoading} onClick={requestLocation} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                      {locationLoading ? 'Locating...' : 'Get Location'}
                    </button>
                  </div>

                  {locationError && (
                    <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', margin: '5px 0 0' }}>{locationError}</p>
                  )}

                  {location && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem', color: '#555', marginTop: '10px' }}>
                      <p><strong>Address:</strong> {location.address}</p>
                      <p><strong>Accuracy:</strong> ±{location.accuracy.toFixed(1)} meters</p>
                      <p><strong>Timestamp:</strong> {location.locationTimestamp.toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  disabled={actionLoading || !capturedPhoto || !location}
                  onClick={handleCheckIn}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: '10px', padding: '15px' }}
                >
                  <UserCheck size={20} /> {actionLoading ? 'Submitting Check-In...' : 'Confirm Check-In'}
                </button>
              </div>
            ) : attendance.attendanceStatus === 'Checked In' ? (
              // CHECK OUT VIEW
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2e7d32', background: '#e8f5e9', padding: '15px', borderRadius: '20px' }}>
                  <CheckCircle size={20} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>Active Check-In: Checked In at {new Date(attendance.checkInTime).toLocaleTimeString()}</span>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <img src={attendance.checkInPhoto?.url} alt="Selfie" style={{ width: '100px', height: '100px', borderRadius: '15px', objectFit: 'cover' }} />
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    <p><strong>Device:</strong> {attendance.deviceInfo?.split(')')[0] + ')' || 'Unknown'}</p>
                    <p><strong>Check-In GPS:</strong> {attendance.checkInLocation?.latitude.toFixed(4)}, {attendance.checkInLocation?.longitude.toFixed(4)}</p>
                  </div>
                </div>

                {/* Geolocation Capture */}
                <div style={{ padding: '20px', background: '#fcfcfc', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} color="var(--primary)" /> Capture GPS Position</span>
                    <button disabled={locationLoading} onClick={requestLocation} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                      {locationLoading ? 'Locating...' : 'Get Location'}
                    </button>
                  </div>

                  {locationError && (
                    <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>{locationError}</p>
                  )}

                  {location && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem', color: '#555', marginTop: '10px' }}>
                      <p><strong>Address:</strong> {location.address}</p>
                      <p><strong>Accuracy:</strong> ±{location.accuracy.toFixed(1)} meters</p>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  disabled={actionLoading || !location}
                  onClick={handleCheckOut}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: '10px', padding: '15px', background: 'var(--secondary)' }}
                >
                  <Clock size={20} /> {actionLoading ? 'Submitting Check-Out...' : 'Confirm Check-Out'}
                </button>
              </div>
            ) : (
              // COMPLETED VIEW
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>Attendance Logged</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>You have successfully checked in and checked out for today.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', fontSize: '0.85rem', padding: '20px', background: '#fafafa', borderRadius: '20px' }}>
                  <div>
                    <p style={{ color: '#888' }}>Check-In Time</p>
                    <p style={{ fontWeight: '800', color: 'var(--secondary)', marginTop: '2px' }}>{new Date(attendance.checkInTime).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#888' }}>Check-Out Time</p>
                    <p style={{ fontWeight: '800', color: 'var(--secondary)', marginTop: '2px' }}>{new Date(attendance.checkOutTime).toLocaleTimeString()}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                    <p style={{ color: '#888' }}>Working Hours</p>
                    <p style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem', marginTop: '2px' }}>{attendance.workingHours} Hours</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Panel */}
          <div style={{ padding: '30px', background: 'white', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f5f5f5', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><History size={20} className="text-primary" /> Attendance Logs History</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', maxHeight: '420px', flex: 1 }}>
              {history.map((log) => (
                <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#fafafa', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {log.checkInPhoto?.url ? (
                      <img src={log.checkInPhoto.url} alt="selfie" style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#ddd' }}></div>
                    )}
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--secondary)' }}>{new Date(log.checkInTime || log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                        In: {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} | 
                        Out: {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                      background: log.attendanceStatus === 'Checked Out' ? '#e8f5e9' : log.attendanceStatus === 'Checked In' ? '#e3f2fd' : '#fff3e0',
                      color: log.attendanceStatus === 'Checked Out' ? '#2e7d32' : log.attendanceStatus === 'Checked In' ? '#1565c0' : '#e65100'
                    }}>
                      {log.attendanceStatus}
                    </span>
                    {log.workingHours && (
                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#666', marginTop: '5px' }}>{log.workingHours} hrs</p>
                    )}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: '40px 0' }}>No attendance history logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
