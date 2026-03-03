import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Shield, Search, Star, ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import SearchableSelect from '@/components/templates/SearchableSelect';
import { useFilterOptions } from '@/hooks/useTemplates';
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

interface MyTemplatesFilters extends TemplateFilters {
  category?: string;
  difficulty?: string;
  targetSystem?: string;
}
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<MyTemplatesFilters>({ sort: 'newest' });

  const { data, isLoading } = useMyTemplates(filters, user?._id);  // Pass userId
  const { data: filterOptions } = useFilterOptions();
  const options = filterOptions?.data;

  const templates = data?.data || [];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput || undefined }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(f => ({
      ...f,
      [key]: value && value !== 'all' ? value : undefined,
    }));
  };

  const setModuleFilter = (moduleName: string | undefined) => {
    setSelectedModule(moduleName || '');
    setFilters(f => ({
      ...f,
      category: moduleName && moduleName !== 'all' ? moduleName : undefined,
    }));
  };

  const setSubcategoryFilter = (subcategoryName: string | undefined) => {
    if (selectedModule && subcategoryName && subcategoryName !== 'all') {
      setFilters(f => ({
        ...f,
        category: `${selectedModule} - ${subcategoryName}`,
      }));
    } else {
      setFilters(f => ({
        ...f,
        category: selectedModule && selectedModule !== 'all' ? selectedModule : undefined,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({ sort: 'newest' });
    setSelectedModule('');
    setSearchInput('');
  };

  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value && key !== 'sort' && key !== 'limit')
    .map(([key]) => key);

  const categoriesHierarchy = options?.categoriesHierarchy || {};
  const modules = Object.keys(categoriesHierarchy);
  const subcategories = selectedModule ? categoriesHierarchy[selectedModule] || [] : [];

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

        {/* Search + Filter toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search my templates..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-10 bg-secondary border-border font-mono text-sm"
            />
          </div>
          <Button
            variant="outline"
            className="border-border hover:border-primary/50 gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-xs font-mono">
                {activeFilters.length}
              </span>
            )}
            {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map(key => (
              <div
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border border-primary/30 rounded text-xs font-mono cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                onClick={() => handleFilterChange(key, undefined)}
                role="button"
                tabIndex={0}
              >
                {key}: {filters[key as keyof MyTemplatesFilters]}
                <X className="h-3 w-3 ml-1" />
              </div>
            ))}
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground font-mono underline">
              Clear all
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-card border-border mb-6 animate-fade-in">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Module/Category with Search */}
                <div>
                  <SearchableSelect
                    label="Module"
                    value={selectedModule}
                    onValueChange={setModuleFilter}
                    placeholder="Select module"
                    options={modules}
                    includeOther={false}
                  />
                </div>

                {/* Subcategory with Search */}
                <div>
                  <SearchableSelect
                    label="Subcategory"
                    value={
                      filters.category && filters.category.includes(' - ')
                        ? filters.category.split(' - ')[1]
                        : ''
                    }
                    onValueChange={setSubcategoryFilter}
                    placeholder="Select subcategory"
                    options={subcategories}
                    disabled={!selectedModule}
                    includeOther={true}
                  />
                </div>

                {/* Target System */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Target System</label>
                  <Select value={filters.targetSystem || ''} onValueChange={v => handleFilterChange('targetSystem', v)}>
                    <SelectTrigger className="bg-muted/50 border-border text-xs h-8">
                      <SelectValue placeholder="All targets" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all" className="text-xs">All targets</SelectItem>
                      {(options?.targetSystems || ['Linux', 'Windows', 'Active Directory', 'Web Application', 'Network', 'Cloud']).map(t => (
                        <SelectItem key={t} value={t} className="text-xs font-mono">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Difficulty</label>
                  <Select value={filters.difficulty || ''} onValueChange={v => handleFilterChange('difficulty', v)}>
                    <SelectTrigger className="bg-muted/50 border-border text-xs h-8">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all" className="text-xs">All levels</SelectItem>
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(d => (
                        <SelectItem key={d} value={d} className="text-xs font-mono">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Sort By</label>
                  <Select value={filters.sort || 'newest'} onValueChange={(v: any) => setFilters(f => ({ ...f, sort: v }))}>
                    <SelectTrigger className="bg-muted/50 border-border text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="newest" className="text-xs">Newest</SelectItem>
                      <SelectItem value="mostUsed" className="text-xs">Most Used</SelectItem>
                      <SelectItem value="topRated" className="text-xs">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                        <span className="inline-block px-2 py-0.5 bg-warning/20 text-warning border border-warning/30 text-xs rounded font-mono">Featured</span>
                      )}
                      {!template.published && (
                        <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded font-mono">Draft</span>
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
