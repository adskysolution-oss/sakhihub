'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, MapPin, Lock, Upload, CheckCircle,
  ArrowRight, ArrowLeft, Users, Briefcase, GraduationCap, Sparkles, ShieldCheck, 
  MessageCircle, ClipboardList, BookOpen, Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const steps = [
  { id: 1, name: "Role", hindi: "भूमिका" },
  { id: 2, name: "Details", hindi: "विवरण" },
  { id: 3, name: "Location", hindi: "स्थान" },
  { id: 4, name: "Connect", hindi: "जुड़ें" },
  { id: 5, name: "Security", hindi: "सुरक्षा" },
];

const designations = [
  "Block Employee",
  "District Coordinator",
  "Volunteer",
  "Delivery Partner",
  "Other"
];

export default function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    role: "",
    fullName: "",
    mobile: "",
    whatsapp: "",
    email: "",
    designation: "",
    qualification: "",
    experience: "",
    state: "",
    district: "",
    block: "",
    area: "",
    pincode: "",
    address: "",
    password: "",
    confirmPassword: "",
    assignedEmployeeId: "",
  });

  const [nearbyEmployees, setNearbyEmployees] = useState<any[]>([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{[key: string]: string}>({});

  React.useEffect(() => {
    if (formData.pincode.length === 6) {
      handlePincodeLookup(formData.pincode);
    }
  }, [formData.pincode]);

  const handlePincodeLookup = async (code: string) => {
    setPincodeLoading(true);
    try {
      const res = await fetch(`/api/pincode/${code}`);
      const result = await res.json();
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          state: result.data.state,
          district: result.data.district,
          block: result.data.block,
          area: result.data.area[0] || ""
        }));
        fetchNearbyEmployees(code, result.data.district, result.data.block);
      }
    } catch (err) {
      console.error("Pincode lookup failed", err);
    } finally {
      setPincodeLoading(false);
    }
  };

  const fetchNearbyEmployees = async (pincode: string, district: string, block: string) => {
    setDiscoveryLoading(true);
    try {
      const res = await fetch(`/api/employees/nearby?pincode=${pincode}&district=${district}&block=${block}`);
      const result = await res.json();
      if (result.success) {
        setNearbyEmployees(result.data);
      }
    } catch (err) {
      console.error("Nearby discovery failed", err);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const handleConnect = async (employeeId: string) => {
    setFormData(prev => ({ ...prev, assignedEmployeeId: employeeId }));
    // If user is already registered, we would send API request here.
    // But since this is registration flow, we will save it during registration.
    setRequestStatus(prev => ({ ...prev, [employeeId]: 'selected' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && !formData.role) return;
    setStep((prev) => Math.min(prev + 1, steps.length));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Registration failed");
      }

      // Success
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      {/* Step Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '0', width: '100%', height: '2px', background: '#eee', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((step - 1) / (steps.length - 1)) * 100}%`, height: '2px', background: 'var(--grad-primary)', zIndex: 1, transition: 'width 0.4s ease' }}></div>

        {steps.map((s) => (
          <div key={s.id} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: step >= s.id ? 'var(--grad-primary)' : 'white',
              border: '2px solid', borderColor: step >= s.id ? 'transparent' : '#eee',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step >= s.id ? 'white' : '#999', fontWeight: '700', fontSize: '0.8rem',
              boxShadow: step === s.id ? '0 0 0 4px rgba(233, 30, 99, 0.1)' : 'none'
            }}>
              {step > s.id ? <CheckCircle size={16} /> : s.id}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: step >= s.id ? 'var(--secondary)' : '#999', textTransform: 'uppercase' }}>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>{steps[step - 1].name} Details</h2>
        <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>{steps[step - 1].hindi} विवरण</p>
      </div>

      <form onSubmit={handleRegister}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...fadeInUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div onClick={() => setFormData({ ...formData, role: "employee" })} style={{ padding: '25px', borderRadius: '24px', border: '2px solid', borderColor: formData.role === "employee" ? 'var(--primary)' : '#f0f0f0', background: formData.role === "employee" ? '#FFF5F8' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(106, 27, 154, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}><Briefcase size={30} /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>Employee</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Field worker / Lead</p>
                </div>
              </div>
              <div onClick={() => setFormData({ ...formData, role: "member" })} style={{ padding: '25px', borderRadius: '24px', border: '2px solid', borderColor: formData.role === "member" ? 'var(--primary)' : '#f0f0f0', background: formData.role === "member" ? '#FFF5F8' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(233, 30, 99, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Users size={30} /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>Member</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Community user</p>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="button" disabled={!formData.role} onClick={nextStep} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: formData.role ? 1 : 0.5 }}>Continue <ArrowRight size={20} /></button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} required />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Mobile</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile No" style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} required />
                  </div>
                </div>
              </div>

              {formData.role === 'employee' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>WhatsApp No</label>
                    <div style={{ position: 'relative' }}>
                      <MessageCircle size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="WhatsApp No" style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Apply For</label>
                    <div style={{ position: 'relative' }}>
                      <ClipboardList size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <select name="designation" value={formData.designation} onChange={handleChange} style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%', appearance: 'none', background: 'white' }} required>
                        <option value="">Select Designation</option>
                        {designations.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formData.role === 'employee' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Qualification</label>
                    <div style={{ position: 'relative' }}>
                      <BookOpen size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="B.A, 12th, etc." style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Experience</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="Years/Details" style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Email (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="button" onClick={nextStep} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Next Step</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Pincode</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6 Digit Pincode" maxLength={6} style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} required />
                  {pincodeLoading && <div className="spinner-small" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}></div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Block / Tehsil</label>
                  <input type="text" name="block" value={formData.block} onChange={handleChange} placeholder="Block Name" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Panchayat / Area</label>
                  <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Area Name" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Full Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Village, Landmark, etc." rows={3} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required></textarea>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="button" onClick={nextStep} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{formData.role === 'member' ? 'Find Nearby Sakhi' : 'Last Step'}</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" {...fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{formData.role === 'member' ? 'Connect with Local Sakhi' : 'Verify Location'}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>{formData.role === 'member' ? 'Choose an employee to assist you with your registration.' : 'Confirm your service area.'}</p>
              </div>

              {formData.role === 'member' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', padding: '5px' }}>
                  {discoveryLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Searching for nearby employees...</div>
                  ) : nearbyEmployees.length > 0 ? (
                    nearbyEmployees.map((emp) => (
                      <div key={emp._id} style={{ 
                        padding: '15px', borderRadius: '18px', border: '2px solid', 
                        borderColor: requestStatus[emp._id] ? 'var(--primary)' : '#eee',
                        background: requestStatus[emp._id] ? '#FFF5F8' : 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '45px', height: '45px', background: 'var(--grad-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <User size={24} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>{emp.fullName}</h4>
                            <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>Code: {emp.employeeId || 'N/A'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', margin: 0 }}>{emp.block}, {emp.district}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleConnect(emp._id)} style={{ 
                          padding: '8px 16px', borderRadius: '10px', border: 'none', 
                          background: requestStatus[emp._id] ? 'var(--primary)' : 'var(--secondary)',
                          color: 'white', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
                        }}>
                          {requestStatus[emp._id] ? 'Selected' : 'Connect'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '20px' }}>
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>No active employees found in your area yet.</p>
                      <button type="button" onClick={nextStep} style={{ color: 'var(--primary)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Continue without connecting</button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '20px' }}>
                  <CheckCircle size={40} style={{ color: 'var(--secondary)', marginBottom: '15px' }} />
                  <p style={{ fontWeight: '700' }}>Your service area is set to:</p>
                  <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem' }}>{formData.block}, {formData.district}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="button" onClick={nextStep} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Continue</button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" {...fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} required />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" style={{ padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #eee', width: '100%' }} required />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '15px', borderRadius: '15px', border: '1px solid #eee' }}>
                <input type="checkbox" id="terms" required style={{ width: '18px', height: '18px' }} />
                <label htmlFor="terms" style={{ fontSize: '0.85rem', color: '#666' }}>I agree to the terms and conditions and privacy policy of SakhiHub.</label>
              </div>

              {error && <p style={{ color: 'red', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
              
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? "Registering..." : (formData.role === 'employee' ? "Register as Employee" : "Join Movement")} <Sparkles size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

const Mail = ({ size, style }: { size: number, style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);


