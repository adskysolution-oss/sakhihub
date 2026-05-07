export type Role = 'admin' | 'employee' | 'member' | 'delivery_partner';

export interface UserProfile {
  id: string;
  full_name: string;
  mobile: string;
  role: Role;
  state?: string;
  district?: string;
  address?: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  target_audience: string;
  status: 'active' | 'completed' | 'upcoming';
}
