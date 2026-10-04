// Live Cloud Backend (Render.com) & Local Fallback
export const LIVE_URL = 'https://oshudhsathi-api.onrender.com/api/v1';
export const LOCAL_LAN_URL = 'http://192.168.31.106:3001/api/v1';

// Point all requests to the live Render cloud API
export const API_BASE_URL = LIVE_URL;

// Auth
export const ENDPOINTS = {
  sendOtp: '/auth/send-otp',
  verifyOtp: '/auth/verify-otp',
  register: '/auth/register',
  login: '/auth/login',
  updateProfile: '/auth/profile',

  // Medicines
  medicines: '/medicines',
  userMedicines: '/user-medicines',
  doseLogs: '/dose-logs',

  // Health
  healthLogs: '/health-logs',

  // Prescriptions
  prescriptions: '/prescriptions',

  // Family & Appointments
  family: '/family',
  appointments: '/appointments',
} as const;
