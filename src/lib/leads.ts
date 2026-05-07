import { supabase } from './supabase';

export interface LeadData {
  full_name: string;
  mobile: string;
  district?: string;
  state?: string;
  interested_in: 'Member' | 'Employee' | 'NGO' | 'Delivery' | 'Volunteer' | 'Bulk Inquiry' | 'General';
  message?: string;
  status?: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Rejected';
  metadata?: any;
}

export async function submitLead(data: LeadData) {
  const { data: result, error } = await supabase
    .from('leads')
    .insert([
      {
        ...data,
        status: data.status || 'New',
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Lead Submission Error:', error);
    throw error;
  }

  return result;
}
