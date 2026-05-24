'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (slug) fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    try {
      const res = await axios.get(`/api/public/forms/${slug}`);
      if (res.data.success) {
        setForm(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setFormData(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter((item: string) => item !== option) };
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(fieldId);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const res = await axios.post('/api/upload', {
          image: reader.result,
          folder: `forms_${slug}`
        });
        if (res.data.success) {
          handleInputChange(fieldId, res.data.data.url);
        }
      } catch (err) {
        toast.error('Failed to upload file. Please try again.');
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateCurrentStep = () => {
    const step = form.steps[currentStep];
    for (const field of step.fields) {
      if (field.required) {
        const val = formData[field.fieldId];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          toast.error(`Please fill the required field: ${field.label}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/public/forms/${slug}/submit`, {
        responses: formData
      });
      if (res.data.success) {
        setSuccess(true);
        window.scrollTo(0, 0);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-32 text-center"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div></div>;
  if (!form) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="bg-white p-12 rounded-3xl shadow-sm text-center max-w-md"><h2 className="text-2xl font-black text-gray-900 mb-2">Form Not Found</h2><p className="text-gray-500">The form you are looking for does not exist or is no longer accepting responses.</p></div></div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[32px] text-center max-w-lg w-full shadow-sm border border-gray-100">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Submitted Successfully!</h2>
          <p className="text-gray-600 font-medium mb-8">
            Thank you for filling out <strong>{form.title}</strong>. Your response has been recorded.
          </p>
        </div>
      </div>
    );
  }

  const step = form.steps[currentStep];
  const progress = ((currentStep) / form.steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="h-1.5 w-full bg-gray-100">
            <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="px-4 py-6">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{form.title}</h1>
            {form.description && <p className="text-gray-500 font-medium">{form.description}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h2 className="text-xl font-black text-primary flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm">{currentStep + 1}</span>
              {step.title}
            </h2>
            {step.description && <p className="text-gray-500 font-medium mt-2 pl-11">{step.description}</p>}
          </div>

          <div className="space-y-8">
            {step.fields.map((field: any) => (
              <div key={field.fieldId} className="space-y-2">
                <label className="block text-sm font-black text-gray-900">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {/* Text / Email / Phone */}
                {['text', 'email', 'phone'].includes(field.type) && (
                  <input 
                    type={field.type === 'phone' ? 'tel' : field.type} 
                    required={field.required}
                    value={formData[field.fieldId] || ''}
                    onChange={(e) => {
                      if (field.type === 'phone') {
                        const val = e.target.value.replace(/\D/g, '');
                        handleInputChange(field.fieldId, val);
                      } else {
                        handleInputChange(field.fieldId, e.target.value);
                      }
                    }}
                    placeholder={field.placeholder}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                )}

                {/* Number */}
                {field.type === 'number' && (
                  <input 
                    type="number"
                    required={field.required}
                    value={formData[field.fieldId] || ''}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                )}

                {/* Date */}
                {field.type === 'date' && (
                  <input 
                    type="date"
                    required={field.required}
                    value={formData[field.fieldId] || ''}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <textarea 
                    required={field.required}
                    value={formData[field.fieldId] || ''}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all min-h-[120px] resize-y"
                  />
                )}

                {/* Select */}
                {field.type === 'select' && (
                  <select
                    required={field.required}
                    value={formData[field.fieldId] || ''}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all appearance-none"
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((opt: string, i: number) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {/* Radio */}
                {field.type === 'radio' && (
                  <div className="space-y-3 mt-2">
                    {field.options?.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData[field.fieldId] === opt ? 'border-pink-500' : 'border-gray-300 group-hover:border-pink-400'}`}>
                          {formData[field.fieldId] === opt && <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
                        </div>
                        <input 
                          type="radio" 
                          name={field.fieldId} 
                          value={opt} 
                          checked={formData[field.fieldId] === opt} 
                          onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                          className="hidden" 
                        />
                        <span className="font-medium text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {field.type === 'checkbox' && (
                  <div className="space-y-3 mt-2">
                    {field.options?.map((opt: string, i: number) => {
                      const isChecked = (formData[field.fieldId] || []).includes(opt);
                      return (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-pink-500 border-pink-500' : 'border-gray-300 group-hover:border-pink-400'}`}>
                            {isChecked && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={(e) => handleCheckboxChange(field.fieldId, opt, e.target.checked)}
                            className="hidden" 
                          />
                          <span className="font-medium text-gray-700">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Toggle */}
                {field.type === 'toggle' && (
                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <div className={`w-12 h-7 rounded-full transition-colors relative ${formData[field.fieldId] ? 'bg-pink-500' : 'bg-gray-200'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={!!formData[field.fieldId]} 
                        onChange={(e) => handleInputChange(field.fieldId, e.target.checked)} 
                      />
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${formData[field.fieldId] ? 'left-6' : 'left-1'}`}></div>
                    </div>
                    <span className="font-medium text-gray-700">{formData[field.fieldId] ? 'Yes' : 'No'}</span>
                  </label>
                )}

                {/* File Upload */}
                {field.type === 'file' && (
                  <div className="mt-2">
                    {formData[field.fieldId] ? (
                      <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-2xl p-6 text-center">
                        <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                        <p className="text-sm font-bold text-green-700 mb-2">File Uploaded Successfully</p>
                        <button onClick={() => handleInputChange(field.fieldId, null)} className="text-xs font-bold text-rose-500 hover:underline">Remove & Re-upload</button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-pink-300 transition-colors bg-gray-50">
                        {uploading === field.fieldId ? (
                          <div className="text-pink-600 font-bold text-sm animate-pulse">Uploading...</div>
                        ) : (
                          <>
                            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                            <label className="text-sm font-black text-pink-600 uppercase tracking-widest cursor-pointer hover:text-pink-700">
                              Choose File
                              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, field.fieldId)} />
                            </label>
                            <p className="text-xs text-gray-400 font-medium mt-2">Max size: 5MB</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
            {currentStep > 0 ? (
              <button 
                onClick={handlePrev} 
                className="px-6 py-3 text-gray-600 font-black text-sm uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
            ) : <div></div>}

            {currentStep < form.steps.length - 1 ? (
              <button 
                onClick={handleNext} 
                className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-pink-200 active:scale-95"
              >
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-pink-200 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Form'}
                {!submitting && <CheckCircle2 size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
