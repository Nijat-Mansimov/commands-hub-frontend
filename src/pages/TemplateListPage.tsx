import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import TemplateCard from '@/components/templates/TemplateCard';
import { useTemplates, useFilterOptions } from '@/hooks/useTemplates';
import { useAuth } from '@/context/AuthContext';
import type { TemplateFilters } from '@/types/template';

const TEMPLATES_PER_PAGE = 12;

const TemplateListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const { user } = useAuth();  // Get current user

  const filters: TemplateFilters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    tool: searchParams.get('tool') || undefined,
    targetSystem: searchParams.get('targetSystem') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    sort: (searchParams.get('sort') as TemplateFilters['sort']) || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: TEMPLATES_PER_PAGE,
  };

  const { data, isLoading } = useTemplates(filters, user?._id);  // Pass userId

  const { data: filterOptions } = useFilterOptions();
  const options = filterOptions?.data;

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const activeFilters = ['search', 'category', 'tool', 'targetSystem', 'difficulty', 'minRating', 'sort']
    .filter(k => searchParams.get(k) && searchParams.get(k) !== 'newest');

  const categoriesHierarchy = options?.categoriesHierarchy || {};
  const modules = Object.keys(categoriesHierarchy);
  const subcategories = selectedModule ? categoriesHierarchy[selectedModule] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-mono mb-1">
            <span className="text-gradient-primary">Attack</span> Payloads
          </h1>
          <p className="text-muted-foreground text-sm">
            {data?.pagination?.total ?? '...'} templates available
          </p>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, tool, category, tag..."
              defaultValue={filters.search || ''}
              onChange={e => {
                const v = e.target.value;
                setTimeout(() => setFilter('search', v || undefined), 400);
              }}
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
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs py-0">
                {activeFilters.length}
              </Badge>
            )}
            {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map(key => (
              <Badge
                key={key}
                className="bg-primary/10 text-primary border-primary/30 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                onClick={() => setFilter(key, undefined)}
              >
                {key}: {searchParams.get(key)}
                <X className="h-3 w-3 ml-1" />
              </Badge>
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
                {/* Module/Category */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Module</label>
                  <Select
                    value={selectedModule}
                    onValueChange={(v) => { setSelectedModule(v); setFilter('category', undefined); }}
                  >
                    <SelectTrigger className="bg-muted/50 border-border text-xs h-8">
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-64">
                      {modules.map(m => (
                        <SelectItem key={m} value={m} className="text-xs font-mono">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Subcategory</label>
                  <Select
                    value={filters.category || ''}
                    onValueChange={(v) => setFilter('category', selectedModule ? `${selectedModule} - ${v}` : v)}
                    disabled={!selectedModule}
                  >
                    <SelectTrigger className="bg-muted/50 border-border text-xs h-8">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-64">
                      {subcategories.map(s => (
                        <SelectItem key={s} value={s} className="text-xs font-mono">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target System */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Target System</label>
                  <Select value={filters.targetSystem || ''} onValueChange={v => setFilter('targetSystem', v)}>
                    <SelectTrigger className="bg-muted/50 border-border text-xs h-8">
                      <SelectValue placeholder="All targets" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all" className="text-xs">All targets</SelectItem>
                      {(options?.targetSystems || ['Linux', 'Windows', 'Active Directory', 'Web Application', 'Network', 'Cloud', 'Cross-Platform', 'Mobile']).map(t => (
                        <SelectItem key={t} value={t} className="text-xs font-mono">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Difficulty</label>
                  <Select value={filters.difficulty || ''} onValueChange={v => setFilter('difficulty', v)}>
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
                  <Select value={filters.sort || 'newest'} onValueChange={v => setFilter('sort', v)}>
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

        {/* Template Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.data.map(template => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => setFilter('page', String((filters.page || 1) - 1))}
                  className="border-border font-mono"
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(data.pagination.pages, 7) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={filters.page === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('page', String(page))}
                        className={`w-8 h-8 font-mono text-xs ${filters.page === page ? 'bg-primary text-primary-foreground' : 'border-border'}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === data.pagination.pages}
                  onClick={() => setFilter('page', String((filters.page || 1) + 1))}
                  className="border-border font-mono"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-mono font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4 border-border font-mono">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateListPage;
