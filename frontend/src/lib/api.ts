export interface LoginResponse {
  user_id: string;
  role: string;
  token?: string;
  verification_status: string;
}

export interface UserOut {
  id: string;
  phone?: string;
  email?: string;
  role: string;
  verification_status: string;
  phone_verified: boolean;
  ngo_verified: boolean;
  full_name?: string;
  organization_name?: string;
  created_at: string;
}

export interface APIResponse<T = any> {
  status: string;
  message_text: string;
  data: T;
}

export interface MandiInfo {
  name: string;
  price: number;
  state?: string;
}

export interface PriceCheckResponse {
  status: string;
  average_price: number;
  user_price: number;
  difference: number;
  difference_pct?: number;
  best_mandi: MandiInfo;
  decision: string;
  message_text: string;
  all_mandis: MandiInfo[];
  data_points?: number;
  fraud_complaint?: any;
}

export interface InputVerifyResponse {
  status: string;
  confidence: number;
  issues: string[];
  message: string;
  extracted: any;
}

export interface LoanEligibilityResponse {
  eligible: boolean;
  score: number;
  trust_level?: string;
  recommended_amount: number;
  reason: string;
  max_amount: number;
}

export interface LoanOption {
  provider: string;
  interest: number;
  max_amount: number;
  tenure_months: number;
  requirements: string[];
}

export interface HelpRequestOut {
  id: string;
  user_id: string;
  request_type: string;
  description: string;
  status: string;
  ngo_notes: string;
  created_at: string;
  updated_at: string;
}

export interface IntentResponse {
  intent: string | null;
  text: string;
  sub: string;
  screen: string | null;
}

export interface FinancialsResponse {
  revenue: number;
  expenses: number;
  mandi_loss: number;
  pesticide_loss: number;
  transport_cost: number;
}

export interface FarmerProfileOut {
  id: string;
  user_id: string;
  name: string;
  village?: string;
  district?: string;
  state?: string;
  crop?: string;
  land_acres: number;
  created_at: string;
  updated_at: string;
}

export interface NGOProfileOut {
  id: string;
  user_id: string;
  registration_number?: string;
  website?: string;
  states_covered: string[];
  districts_covered: string[];
  focus_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminProfileOut {
  id: string;
  user_id: string;
  admin_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileOut {
  status: string;
  profile_type: "farmer" | "ngo" | "admin";
  data: FarmerProfileOut | NGOProfileOut | AdminProfileOut | any;
}

export interface ProfileCreate {
  // Farmer
  name?: string;
  village?: string;
  district?: string;
  state?: string;
  crop?: string;
  land_acres?: number;
  // NGO
  registration_number?: string;
  website?: string;
  states_covered?: string[];
  districts_covered?: string[];
  focus_areas?: string[];
  // Admin
  admin_id?: string;
}
