// Bundle system types
export interface Bundle {
  id: string;
  name: string;
  description: string | null;
  custom_price: number;
  late_fee_days: number;
  late_fee_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BundleService {
  id: string;
  bundle_id: string;
  service_id: string;
  created_at: string;
}

export interface BundleBooking {
  id: string;
  bundle_id: string;
  user_id: string;
  slot_id: string;
  total_price: number;
  late_fee: number;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

// Extended types with joined data
export interface BundleWithServices extends Bundle {
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export interface BundleSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  min_available_seats: number;
  all_services_available: boolean;
}

// Cart item type for bundles
export interface BundleCartItem {
  type: 'bundle';
  bundleBookingId: string;
  bundleId: string;
  bundleName: string;
  timeSlotId: string;
  timeSlotStart: string;
  price: number;
  lateFee: number;
  includedServices: Array<{
    serviceId: string;
    serviceName: string;
  }>;
}

// API request/response types
export interface CreateBundleRequest {
  name: string;
  description?: string;
  custom_price: number;
  late_fee_days?: number;
  late_fee_amount?: number;
  service_ids: string[];
  is_active?: boolean;
}

export interface UpdateBundleRequest extends Partial<CreateBundleRequest> {
  id: string;
}

export interface BundleAvailabilityRequest {
  bundleId: string;
  startDate?: string;
  endDate?: string;
}

export interface BundleAvailabilityResponse {
  slots: BundleSlot[];
}

export interface CreateBundleBookingRequest {
  bundleId: string;
  timeSlotId: string;
  slotStartTime: string;
}

export interface CreateBundleBookingResponse {
  bundleBookingId: string;
  bundleId: string;
  bundleName: string;
  price: number;
  lateFee: number;
  totalPrice: number;
  bundle: BundleWithServices;
  slot: {
    id: string;
    start_time: string;
    end_time: string;
  };
}
