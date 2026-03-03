import { useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesService } from '@/services/templates';
import { authService } from '@/services/auth';
import type { Template, TemplateFilters } from '@/types/template';
import type { User, RegisterCredentials } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

// =====================================================
// TEMPLATE MUTATIONS
// =====================================================

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Partial<Template>) => 
      templatesService.create(template).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create template',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, template }: { id: string; template: Partial<Template> }) =>
      templatesService.update(id, template).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['template', data._id] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update template',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete template',
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateCommand = () => {
  return useMutation({
    mutationFn: ({ id, fieldValues }: { id: string; fieldValues: Record<string, string> }) =>
      templatesService.generate(id, fieldValues).then(res => res.data),
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate command',
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateBatchCommands = () => {
  return useMutation({
    mutationFn: ({ id, fieldValueSets }: { id: string; fieldValueSets: Record<string, string>[] }) =>
      templatesService.generateBatch(id, fieldValueSets).then(res => res.data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Commands generated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate commands',
        variant: 'destructive',
      });
    },
  });
};

export const useRateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, score, comment }: { id: string; score: number; comment?: string }) =>
      templatesService.rate(id, score, comment).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['template', id] });
      queryClient.invalidateQueries({ queryKey: ['ratings', id] });
      toast({
        title: 'Success',
        description: 'Rating added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add rating',
        variant: 'destructive',
      });
    },
  });
};

export const useFeatureTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesService.feature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Success',
        description: 'Template featured',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to feature template',
        variant: 'destructive',
      });
    },
  });
};

export const useUnfeatureTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesService.unfeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Success',
        description: 'Template unfeatured',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to unfeature template',
        variant: 'destructive',
      });
    },
  });
};

// =====================================================
// AUTH MUTATIONS
// =====================================================

export const useRegister = () => {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      authService.register(credentials).then(res => res.data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Account created! Please log in.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });
};
