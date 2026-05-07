'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Phone, MapPin, Lock, Upload, CheckCircle, 
  ArrowRight, ArrowLeft, Users, Briefcase, GraduationCap, Sparkles, ShieldCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

const steps = [
  { id: 1, name: "Role", hindi: "भूमिका" },
  { id: 2, name: "Personal", hindi: "विवरण" },
  { id: 3, name: "Address", hindi: "पता" },
  { id: 4, name: "Finish", hindi: "पूर्ण" },
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
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
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
    <div style={{ width: '100%', maxWidth: '550px' }}>
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
         <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>{steps[step-1].name} Details</h2>
         <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>{steps[step-1].hindi} विवरण</p>
      </div>

      <form onSubmit={handleRegister}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...fadeInUp} style={{ display: 'grid', gap: '20px' }}>
              <div onClick={() => setFormData({...formData, role: "member"})} style={{ padding: '25px', borderRadius: '24px', border: '2px solid', borderColor: formData.role === "member" ? 'var(--primary)' : '#f0f0f0', background: formData.role === "member" ? '#FFF5F8' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(233, 30, 99, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Users size={30} /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>{t('join_btn')}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get community support & products.</p>
                </div>
              </div>
              <div onClick={() => setFormData({...formData, role: "admin"})} style={{ padding: '25px', borderRadius: '24px', border: '2px solid', borderColor: formData.role === "admin" ? 'var(--primary)' : '#f0f0f0', background: formData.role === "admin" ? '#FFF5F8' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(106, 27, 154, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}><ShieldCheck size={30} /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>Super Admin</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform management role.</p>
                </div>
              </div>
              <button type="button" disabled={!formData.role} onClick={nextStep} className="btn-primary" style={{ marginTop: '20px', justifyContent: 'center', opacity: formData.role ? 1 : 0.5 }}>Continue <ArrowRight size={20} /></button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Name" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Mobile</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Number" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="button" onClick={nextStep} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Next</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
              </div>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full Address" rows={3} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required></textarea>
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="button" onClick={nextStep} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Last Step</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" {...fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" style={{ padding: '14px', borderRadius: '14px', border: '1px solid #eee' }} required />
                </div>
              </div>
              {error && <p style={{ color: 'red', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? "Joining..." : "Join SakhiHub"} <Sparkles size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}


