import axios from 'axios';
import { toast } from 'sonner';

// Base API Configuration
const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Auth Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('annadata_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Standardized Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message_text || error.message || 'An unexpected error occurred';
    
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      localStorage.removeItem('annadata_token');
      localStorage.removeItem('annadata_user_role');
      // Redirect or handle logout logic here if needed
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// --- API METHODS ---

/**
 * AUTHENTICATION
 */
export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  register: (data: any) => apiClient.post('/auth/register', data),
  ngoLogin: (data: any) => apiClient.post('/auth/ngo/login', data),
  ngoRegister: (data: any) => apiClient.post('/auth/ngo/register', data),
  getMe: () => apiClient.get('/auth/me'),
  completeOnboarding: () => apiClient.post('/auth/onboarding/complete'),
};

/**
 * PROFILE
 */
export const profileApi = {
  getProfile: (userId: string) => apiClient.get(`/profile/${userId}`),
  updateProfile: (data: any) => apiClient.post('/profile', data),
};

/**
 * UNIFIED REQUESTS (Complaints, Loans, Verifications)
 */
export const requestApi = {
  create: (data: { user_id: string; type: string; payload: any; description?: string }) => 
    apiClient.post('/requests', data),
  
  getUserRequests: (userId: string) => 
    apiClient.get(`/requests/user/${userId}`),
  
  getAllRequests: () => 
    apiClient.get('/requests/ngo/all'),
  
  updateStatus: (requestId: string, data: { status: string; ngo_notes?: string }) => 
    apiClient.patch(`/requests/${requestId}`, data),
};

/**
 * NGO MODULE
 */
export const ngoApi = {
  getFarmers: (status = 'needs_manual_review') => 
    apiClient.get(`/ngo/farmers?filter_status=${status}`),
  
  verifyFarmer: (data: { farmer_id: string; action: 'approve' | 'reject'; notes?: string }) => 
    apiClient.post('/ngo/verify', data),
  
  getHelpRequests: () => 
    apiClient.get('/ngo/help-requests'),
  
  updateHelpRequest: (data: { request_id: string; status: string; notes?: string }) => 
    apiClient.post('/ngo/help-update', data),
  
  getPendingScans: () => 
    apiClient.get('/ngo/pending-scans'),
  
  resolveScan: (scanId: string, action: 'clean' | 'fraud', notes?: string) => 
    apiClient.post(`/ngo/resolve-scan?scan_id=${scanId}&action=${action}&notes=${notes}`),
  
  getStats: () => 
    apiClient.get('/ngo/stats'),
};

/**
 * ADMIN MODULE
 */
export const adminApi = {
  getUsers: (role?: string, skip = 0, limit = 50) => {
    let url = `/admin/users?skip=${skip}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    return apiClient.get(url);
  },
  
  verifyNGO: (data: { user_id: string; approve: boolean }) => 
    apiClient.post('/admin/verify-ngo', data),
  
  overrideVerification: (data: { user_id: string; status: string; reason: string }) => 
    apiClient.post('/admin/override-verification', data),
};

/**
 * LOANS
 */
export const loanApi = {
  checkEligibility: (userId: string) => 
    apiClient.post('/loan/check-eligibility', { user_id: userId }),
  
  checkCredibility: () => 
    apiClient.post('/loan/check-credibility'),
  
  getOptions: () => 
    apiClient.get('/loan/options'),
};

/**
 * INPUT VERIFICATION (Pesticide Scans)
 */
export const inputApi = {
  verify: (data: { image: string; mode: 'bottle' | 'bill'; pesticide_name?: string; batch_number?: string; brand?: string }) => 
    apiClient.post('/verify-input', data),
};

/**
 * CHATBOT
 */
export const chatbotApi = {
  query: (text: string, lang = 'en') => 
    apiClient.post('/chatbot/query', { text, lang }),
  
  confirm: (intent: string, payload: any, lang = 'en') => 
    apiClient.post('/chatbot/confirm', { intent, payload, lang }),
};

/**
 * HEATMAP / MAP
 */
export const mapApi = {
  getPoints: () => apiClient.get('/heatmap/points'),
  getSummary: () => apiClient.get('/heatmap/summary'),
};
