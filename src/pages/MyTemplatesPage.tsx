import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Shield, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMyTemplates } from '@/hooks/useTemplates';
import { templatesService } from '@/services/templates';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { TemplateFilters } from '@/types/template';

const MyTemplatesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();  // Get current user
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>({ sort: 'newest' });

  const { data, isLoading } = useMyTemplates(filters, user?._id);  // Pass userId

  const templates = data?.data || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await templatesService.delete(deleteId);
      toast({ title: 'Template deleted' });
      queryClient.invalidateQueries({ queryKey: ['templates', 'my'] });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete template.', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-mono">
              <span className="text-gradient-primary">My</span> Templates
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{data?.pagination?.total || 0} templates created</p>
          </div>
          <Link to="/templates/create">
            <Button className="bg-primary text-primary-foreground font-mono">
              <Plus className="h-4 w-4 mr-1.5" /> Create New
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search my templates..."
              onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
              className="pl-10 bg-secondary border-border font-mono text-sm"
            />
          </div>
          <Select value={filters.sort || 'newest'} onValueChange={(v: any) => setFilters(f => ({ ...f, sort: v }))}>
            <SelectTrigger className="w-36 bg-secondary border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="mostUsed">Most Used</SelectItem>
              <SelectItem value="topRated">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Shield className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-mono font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Share your knowledge with the community.</p>
            <Link to="/templates/create">
              <Button className="bg-primary text-primary-foreground font-mono">
                <Plus className="h-4 w-4 mr-1.5" /> Create Your First Template
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map(template => (
              <Card key={template._id} className="bg-card border-border hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                      {template.isFeatured && (
                        <Badge className="bg-warning/20 text-warning border-warning/30 text-xs shrink-0">Featured</Badge>
                      )}
                      {!template.published && (
                        <Badge className="bg-muted text-muted-foreground text-xs shrink-0">Draft</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{template.category}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-warning" />
                        {(template.ratings?.averageRating || 0).toFixed(1)} ({template.ratings?.totalRatings || 0})
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {template.usageCount || 0} uses
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/templates/${template._id}`}>
                      <Button variant="ghost" size="sm" className="h-8 font-mono text-xs">
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </Link>
                    <Link to={`/templates/${template._id}/edit`}>
                      <Button variant="outline" size="sm" className="h-8 border-border font-mono text-xs hover:border-primary/50">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(template._id)}
                      className="h-8 font-mono text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono">Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The template will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border font-mono">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground font-mono">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTemplatesPage;
