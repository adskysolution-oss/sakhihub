'use client';

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Plus, Trash2, GripVertical, Save, Settings, X, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from 'sonner';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

interface FormField {
  fieldId: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormStep {
  stepId: string;
  title: string;
  description: string;
  fields: FormField[];
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  steps: FormStep[];
}

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(editId ? true : false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: 'Untitled Form',
    slug: '',
    description: '',
    isActive: true,
    steps: [
      {
        stepId: generateId(),
        title: 'Step 1',
        description: '',
        fields: []
      }
    ]
  });

  useEffect(() => {
    if (editId) {
      fetchForm();
    }
  }, [editId]);

  const fetchForm = async () => {
    try {
      const res = await axios.get(`/api/admin/forms/${editId}`);
      if (res.data.success) {
        setForm(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await axios.put(`/api/admin/forms/${editId}`, form);
        toast.success('Form updated successfully');
      } else {
        const res = await axios.post('/api/admin/forms', form);
        toast.success('Form created successfully');
        router.push(`/admin/forms/builder?id=${res.data.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          stepId: generateId(),
          title: `Step ${prev.steps.length + 1}`,
          description: '',
          fields: []
        }
      ]
    }));
  };

  const deleteStep = (stepIndex: number) => {
    if (form.steps.length === 1) return toast.error("Form must have at least one step");
    setForm(prev => {
      const newSteps = [...prev.steps];
      newSteps.splice(stepIndex, 1);
      return { ...prev, steps: newSteps };
    });
  };

  const moveStep = (stepIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && stepIndex === 0) return;
    if (direction === 'down' && stepIndex === form.steps.length - 1) return;
    
    setForm(prev => {
      const newSteps = [...prev.steps];
      const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
      const temp = newSteps[stepIndex];
      newSteps[stepIndex] = newSteps[targetIndex];
      newSteps[targetIndex] = temp;
      return { ...prev, steps: newSteps };
    });
  };

  const addField = (stepIndex: number) => {
    setForm(prev => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].fields.push({
        fieldId: `field_${generateId()}`,
        label: 'New Field',
        type: 'text',
        placeholder: '',
        required: false,
        options: []
      });
      return { ...prev, steps: newSteps };
    });
  };

  const updateField = (stepIndex: number, fieldIndex: number, updates: any) => {
    setForm(prev => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].fields[fieldIndex] = {
        ...newSteps[stepIndex].fields[fieldIndex],
        ...updates
      };
      return { ...prev, steps: newSteps };
    });
  };

  const deleteField = (stepIndex: number, fieldIndex: number) => {
    setForm(prev => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].fields.splice(fieldIndex, 1);
      return { ...prev, steps: newSteps };
    });
  };

  const moveField = (stepIndex: number, fieldIndex: number, direction: 'up' | 'down') => {
    setForm(prev => {
      const newSteps = [...prev.steps];
      const fields = newSteps[stepIndex].fields;
      if (direction === 'up' && fieldIndex === 0) return prev;
      if (direction === 'down' && fieldIndex === fields.length - 1) return prev;
      
      const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
      const temp = fields[fieldIndex];
      fields[fieldIndex] = fields[targetIndex];
      fields[targetIndex] = temp;
      return { ...prev, steps: newSteps };
    });
  };

  if (loading) return <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-8 sticky top-4 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <input 
            type="text" 
            value={form.title} 
            onChange={(e) => setForm({...form, title: e.target.value})} 
            className="text-3xl font-black text-gray-900 w-full focus:outline-none focus:border-b-2 border-primary bg-transparent placeholder-gray-300 mb-2"
            placeholder="Form Title"
          />
          <input 
            type="text" 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            className="text-gray-500 font-medium w-full focus:outline-none bg-transparent"
            placeholder="Form description (optional)"
          />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-600">
            <input 
              type="checkbox" 
              checked={form.isActive} 
              onChange={(e) => setForm({...form, isActive: e.target.checked})} 
              className="w-4 h-4 text-primary"
            />
            Active Form
          </label>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {form.steps.map((step, stepIndex) => (
          <div key={step.stepId} className="bg-gray-50 rounded-[32px] p-8 border border-gray-200 relative group">
            {/* Step Header */}
            <div className="flex items-start gap-4 mb-8">
              <div className="flex flex-col gap-1 mt-2">
                <button onClick={() => moveStep(stepIndex, 'up')} disabled={stepIndex === 0} className="text-gray-400 hover:text-primary disabled:opacity-30"><ChevronUp size={20} /></button>
                <button onClick={() => moveStep(stepIndex, 'down')} disabled={stepIndex === form.steps.length - 1} className="text-gray-400 hover:text-primary disabled:opacity-30"><ChevronDown size={20} /></button>
              </div>
              <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={step.title} 
                    onChange={(e) => {
                      const newSteps = [...form.steps];
                      newSteps[stepIndex].title = e.target.value;
                      setForm({...form, steps: newSteps});
                    }}
                    className="text-xl font-bold text-gray-900 w-full focus:outline-none mb-1"
                    placeholder={`Step ${stepIndex + 1} Title`}
                  />
                  <input 
                    type="text" 
                    value={step.description || ''} 
                    onChange={(e) => {
                      const newSteps = [...form.steps];
                      newSteps[stepIndex].description = e.target.value;
                      setForm({...form, steps: newSteps});
                    }}
                    className="text-sm text-gray-500 font-medium w-full focus:outline-none"
                    placeholder="Step description (optional)"
                  />
                </div>
                <button onClick={() => deleteStep(stepIndex)} className="text-gray-400 hover:text-rose-500 self-start p-2"><Trash2 size={18} /></button>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4 pl-12 pr-4">
              {step.fields.map((field, fieldIndex) => (
                <div key={field.fieldId} className="bg-white rounded-2xl p-6 border-l-4 border-l-pink-500 border-y border-r border-gray-200 shadow-sm flex gap-4 group/field relative transition-all focus-within:ring-2 focus-within:ring-pink-200">
                  <div className="flex flex-col gap-1 text-gray-300">
                    <button onClick={() => moveField(stepIndex, fieldIndex, 'up')} disabled={fieldIndex === 0} className="hover:text-pink-500 disabled:opacity-30"><ChevronUp size={16} /></button>
                    <GripVertical size={16} className="my-1 cursor-move" />
                    <button onClick={() => moveField(stepIndex, fieldIndex, 'down')} disabled={fieldIndex === step.fields.length - 1} className="hover:text-pink-500 disabled:opacity-30"><ChevronDown size={16} /></button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={field.label} 
                          onChange={(e) => updateField(stepIndex, fieldIndex, { label: e.target.value })}
                          className="text-lg font-bold text-gray-900 w-full focus:outline-none border-b border-transparent focus:border-gray-300 pb-1 bg-transparent"
                          placeholder="Question Label"
                        />
                      </div>
                      <select 
                        value={field.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          const updates: any = { type: newType };
                          
                          if (newType === 'phone') {
                            updates.label = 'Phone Number';
                            updates.placeholder = 'Enter phone number';
                          } else if (newType === 'text') {
                            updates.label = 'Enter Text';
                            updates.placeholder = 'Type here';
                          } else if (newType === 'email') {
                            updates.label = 'Email Address';
                            updates.placeholder = 'Enter email address';
                          } else if (newType === 'number') {
                            updates.label = 'Enter Number';
                            updates.placeholder = 'e.g., 100';
                          } else if (newType === 'textarea') {
                            updates.label = 'Enter Details';
                            updates.placeholder = 'Type your details here';
                          } else if (newType === 'date') {
                            updates.label = 'Select Date';
                          } else if (newType === 'select') {
                            updates.label = 'Choose an option';
                          } else if (newType === 'radio') {
                            updates.label = 'Select one option';
                          } else if (newType === 'checkbox') {
                            updates.label = 'Select all that apply';
                          } else if (newType === 'file') {
                            updates.label = 'Upload Document';
                          } else if (newType === 'toggle') {
                            updates.label = 'Enable feature?';
                          }
                          
                          updateField(stepIndex, fieldIndex, updates);
                        }}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-bold text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Paragraph</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="date">Date</option>
                        <option value="select">Dropdown</option>
                        <option value="radio">Multiple Choice</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="file">File Upload</option>
                        <option value="toggle">Toggle/Switch</option>
                      </select>
                    </div>

                    {['text', 'number', 'email', 'phone', 'textarea'].includes(field.type) && (
                      <input 
                        type="text" 
                        value={field.placeholder || ''} 
                        onChange={(e) => updateField(stepIndex, fieldIndex, { placeholder: e.target.value })}
                        className="text-sm text-gray-500 w-full border-b border-dashed border-gray-300 pb-1 focus:outline-none focus:border-pink-500 bg-transparent"
                        placeholder="Placeholder text (optional)"
                      />
                    )}

                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                      <div className="space-y-2 mt-4">
                        {(field.options || []).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className={`w-4 h-4 border border-gray-300 ${field.type === 'radio' ? 'rounded-full' : 'rounded-sm'}`}></div>
                            <input 
                              type="text" 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...(field.options || [])];
                                newOpts[optIndex] = e.target.value;
                                updateField(stepIndex, fieldIndex, { options: newOpts });
                              }}
                              className="text-sm font-medium text-gray-700 focus:outline-none border-b border-transparent focus:border-gray-300 pb-0.5 flex-1"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            <button 
                              onClick={() => {
                                const newOpts = [...(field.options || [])];
                                newOpts.splice(optIndex, 1);
                                updateField(stepIndex, fieldIndex, { options: newOpts });
                              }}
                              className="text-gray-300 hover:text-rose-500"
                            ><X size={14} /></button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newOpts = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                            updateField(stepIndex, fieldIndex, { options: newOpts });
                          }}
                          className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 mt-2"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end justify-between border-l border-gray-100 pl-4 ml-2 shrink-0">
                    <button onClick={() => deleteField(stepIndex, fieldIndex)} className="text-gray-400 hover:text-rose-500 p-2"><Trash2 size={16} /></button>
                    <label className="flex items-center gap-2 cursor-pointer mt-auto">
                      <span className="text-xs font-bold text-gray-400 uppercase">Required</span>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${field.required ? 'bg-pink-500' : 'bg-gray-200'}`}>
                        <input type="checkbox" className="hidden" checked={field.required} onChange={(e) => updateField(stepIndex, fieldIndex, { required: e.target.checked })} />
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${field.required ? 'left-5' : 'left-1'}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => addField(stepIndex)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Field
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={addStep}
          className="bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all inline-flex items-center gap-2"
        >
          <Plus size={18} /> Add New Step
        </button>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
        <BuilderContent />
      </Suspense>
    </DashboardLayout>
  );
}
