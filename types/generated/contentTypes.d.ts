// Auto-generated types for Supabase tables
// Extend this as your schema evolves

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: 'admin' | 'user' | 'org_admin';
  is_org_admin?: boolean;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  settings?: Record<string, string | number | boolean>;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  capacity?: number;
  price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  id: string;
  service_id: string;
  start_time: string; // ISO 8601 timestamp
  end_time: string; // ISO 8601 timestamp
  capacity: number;
  booked_count?: number;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  slot_id: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  inventory?: number;
  images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total?: number;
  stripe_payment_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price?: number;
  created_at?: string;
}
