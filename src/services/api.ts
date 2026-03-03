import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://commands-hub-backend.onrender.com/api';

// Create API instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// =====================================================
// REQUEST INTERCEPTOR
// Add auth headers, logging, etc.
// =====================================================

api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    // Add custom headers if needed (e.g., API key)
    // config.headers['X-API-Key'] = 'your-api-key';

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// Handle errors, auth failures, etc.
// =====================================================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      const url = response.config.url || '';
      if (url.includes('/auth/login')) {
        console.log(`[API] LOGIN RESPONSE:`, {
          status: response.status,
          url,
          success: response.data?.success,
          user: response.data?.user,
        });
      } else {
        console.log(`[API Response] ${response.status} ${url}`, response.data);
      }
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message || error.message;
    const url = error.config?.url || '';
    const method = error.config?.method?.toUpperCase() || 'REQUEST';

    console.error(`[API Error] ${status} ${method} ${url}`, {
      message,
      data: error.response?.data,
    });

    switch (status) {
      case 401:
        // Unauthorized - Only logout if it's not a profile check and not a validation error
        if (!url?.includes('/auth/profile') && !url?.includes('/auth/login') && !url?.includes('/auth/register')) {
          // Only redirect if it looks like a real session expiration
          console.warn('[API] Unauthorized - Session may have expired. Will require re-login on next action');
          // Don't immediately redirect - let the component handle it
          // window.location.href = '/login';
        }
        break;

      case 403:
        // Forbidden - user doesn't have permission
        console.warn('[API] Forbidden access:', url);
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to perform this action',
          variant: 'destructive',
        });
        break;

      case 404:
        // Not found - don't show toast for this, let component handle it
        console.warn('[API] Resource not found:', url);
        break;

      case 422:
      case 400:
        // Validation error - let component handle it
        console.warn('[API] Validation error:', error.response?.data);
        // Don't show a generic toast, let the component show specific field errors
        break;

      case 500:
        // Server error
        toast({
          title: 'Server Error',
          description: 'An error occurred on the server. Please try again later.',
          variant: 'destructive',
        });
        console.error('[API] Server error:', error.response?.data);
        break;

      case undefined:
        // Network error (no response from server)
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your connection.',
          variant: 'destructive',
        });
        console.error('[API] Network error:', error.message);
        break;

      default:
        // Other errors - only show toast for unexpected ones
        if (status && status >= 500) {
          toast({
            title: 'Error',
            description: message || 'An unexpected error occurred',
            variant: 'destructive',
          });
        }
        console.error('[API] Error:', error);
    }

    return Promise.reject(error);
  }
);

export default api;
