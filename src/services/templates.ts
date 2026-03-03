import api from './api';
import type { Template, FilterOptions, TemplateFilters, PaginatedResponse, AdminStats, PublicStats } from '@/types/template';
import type { ApiResponse } from '@/types/common';

export const templatesService = {
  getAll: async (filters: TemplateFilters = {}) => {
    const params = new URLSearchParams();
    
    // Build params, handling arrays properly
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return;
      
      // Handle arrays (join with comma)
      if (Array.isArray(value)) {
        const joinedValue = value.join(',');
        if (joinedValue) {
          params.set(key, joinedValue);
        }
        return;
      }
      
      // Handle all other filters normally
      params.set(key, String(value));
    });
    
    const { data } = await api.get<PaginatedResponse<Template>>(`/templates?${params}`);
    return data;
  },

  getFeatured: async () => {
    const { data } = await api.get<ApiResponse<Template[]>>('/templates/featured');
    return data;
  },

  getPopular: async () => {
    const { data } = await api.get<ApiResponse<Template[]>>('/templates/popular');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Template>>(`/templates/${id}`);
    return data;
  },

  getSimilar: async (id: string) => {
    const { data } = await api.get<ApiResponse<Template[]>>(`/templates/${id}/similar`);
    return data;
  },

  getMyTemplates: async (filters: TemplateFilters = {}) => {
    const params = new URLSearchParams();
    
    // Build params, handling arrays properly
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return;
      
      // Handle arrays (join with comma)
      if (Array.isArray(value)) {
        const joinedValue = value.join(',');
        if (joinedValue) {
          params.set(key, joinedValue);
        }
        return;
      }
      
      // Handle all other filters normally
      params.set(key, String(value));
    });
    
    const { data } = await api.get<PaginatedResponse<Template>>(`/templates/my-templates?${params}`);
    return data;
  },

  create: async (template: Partial<Template>) => {
    const { data } = await api.post<ApiResponse<Template>>('/templates', template);
    return data;
  },

  update: async (id: string, template: Partial<Template>) => {
    const { data } = await api.put<ApiResponse<Template>>(`/templates/${id}`, template);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/templates/${id}`);
    return data;
  },

  generate: async (id: string, fieldValues: Record<string, string>) => {
    const { data } = await api.post<ApiResponse<{ command: string }>>(`/templates/${id}/generate`, { fieldValues });
    return data;
  },

  generateBatch: async (id: string, fieldValueSets: Record<string, string>[]) => {
    const { data } = await api.post<ApiResponse<{ commands: string[] }>>(`/templates/${id}/generate/batch`, { fieldValueSets });
    return data;
  },

  rate: async (id: string, score: number, comment?: string) => {
    const { data } = await api.post(`/templates/${id}/rate`, { score, comment });
    return data;
  },

  getRatings: async (id: string, page = 1) => {
    const { data } = await api.get(`/templates/${id}/ratings?page=${page}`);
    return data;
  },

  getFilterOptions: async () => {
    const { data } = await api.get<ApiResponse<FilterOptions>>('/templates/filters/options');
    return data;
  },

  advancedSearch: async (query: string, fields?: string) => {
    const params = new URLSearchParams({ query });
    if (fields) params.set('fields', fields);
    const { data } = await api.get<PaginatedResponse<Template>>(`/templates/search/advanced?${params}`);
    return data;
  },

  feature: async (id: string) => {
    const { data } = await api.post(`/templates/${id}/feature`);
    return data;
  },

  unfeature: async (id: string) => {
    const { data } = await api.post(`/templates/${id}/unfeature`);
    return data;
  },

  getAdminStats: async () => {
    const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return data;
  },

  getPublicStats: async () => {
    const { data } = await api.get<ApiResponse<PublicStats>>('/templates/stats/public');
    return data;
  },
};
