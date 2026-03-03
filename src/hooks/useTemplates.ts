import { useQuery } from '@tanstack/react-query';
import { templatesService } from '@/services/templates';
import type { TemplateFilters } from '@/types/template';

// Default retry configuration - retry on network errors but not on 4xx errors
const retryConfig = {
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (client errors) or after 3 attempts
    if (failureCount >= 3) return false;
    if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
      return false;
    }
    // Retry on 5xx errors or network errors
    return true;
  },
  retryDelay: (attemptIndex: number) => {
    // Exponential backoff: 500ms, 1000ms, 2000ms
    return Math.min(1000 * 2 ** attemptIndex, 30000);
  },
};

export const useTemplates = (filters: TemplateFilters = {}, userId?: string) => {
  return useQuery({
    queryKey: ['templates', userId, filters],  // Include userId in cache key!
    queryFn: () => templatesService.getAll(filters),
    ...retryConfig,
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesService.getById(id),
    enabled: !!id,
    // Always fetch fresh data - viewCount increments on every visit
    staleTime: 0, // Always consider data stale, forces refetch on mount
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes for offline support
    refetchOnMount: true, // Always refetch when component mounts
    ...retryConfig,
  });
};

export const useFeaturedTemplates = () => {
  return useQuery({
    queryKey: ['templates', 'featured'],
    queryFn: () => templatesService.getFeatured(),
    ...retryConfig,
  });
};

export const usePopularTemplates = () => {
  return useQuery({
    queryKey: ['templates', 'popular'],
    queryFn: () => templatesService.getPopular(),
    ...retryConfig,
  });
};

export const useMyTemplates = (filters: TemplateFilters = {}, userId?: string) => {
  return useQuery({
    queryKey: ['templates', 'my', userId, filters],  // Include userId in cache key!
    queryFn: () => templatesService.getMyTemplates(filters),
    enabled: !!userId,  // Don't fetch if no userId
    ...retryConfig,
  });
};

export const useSimilarTemplates = (id: string) => {
  return useQuery({
    queryKey: ['templates', 'similar', id],
    queryFn: () => templatesService.getSimilar(id),
    enabled: !!id,
    ...retryConfig,
  });
};

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ['filters', 'options'],
    queryFn: () => templatesService.getFilterOptions(),
    staleTime: 5 * 60 * 1000,
    ...retryConfig,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => templatesService.getAdminStats(),
    ...retryConfig,
  });
};

export const usePublicStats = () => {
  return useQuery({
    queryKey: ['stats', 'public'],
    queryFn: () => templatesService.getPublicStats(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    ...retryConfig,
  });
};
