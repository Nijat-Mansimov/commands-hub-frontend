import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Copy, Terminal, Shield, ChevronRight, Tag, Eye, Calendar, User, Globe, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import CommandGenerator from '@/components/templates/CommandGenerator';
import RatingForm from '@/components/templates/RatingForm';
import RatingList from '@/components/templates/RatingList';
import TemplateCard from '@/components/templates/TemplateCard';
import { useTemplate, useSimilarTemplates } from '@/hooks/useTemplates';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const difficultyClasses: Record<string, string> = {
  Beginner: 'difficulty-beginner',
  Intermediate: 'difficulty-intermediate',
  Advanced: 'difficulty-advanced',
  Expert: 'difficulty-expert',
};

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useTemplate(id!);
  const { data: similarData } = useSimilarTemplates(id!);
  const { user } = useAuth();
  const template = data?.data;

  // Sync template data to all related caches when it updates (for real-time updates across lists)
  useEffect(() => {
    if (template) {
      // Update ALL template list caches that might contain this template
      // Use queryClient.setQueriesData to update all matching cache keys
      queryClient.setQueriesData(
        { queryKey: ['templates'] },
        (oldData: any) => {
          if (!oldData?.data || !Array.isArray(oldData.data)) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((t: any) => 
              t._id === template._id ? template : t
            ),
          };
        }
      );

      // Also specifically update featured and popular
      queryClient.setQueryData(['templates', 'featured'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((t: any) => t._id === template._id ? template : t),
        };
      });

      queryClient.setQueryData(['templates', 'popular'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((t: any) => t._id === template._id ? template : t),
        };
      });
    }
  }, [template, queryClient]);

  // When user navigates away from detail page, invalidate list caches
  // so they refetch with updated data
  useEffect(() => {
    return () => {
      // Cleanup: invalidate list caches when leaving detail page
      queryClient.invalidateQueries({ queryKey: ['templates'], exact: false });
    };
  }, [id, queryClient]);

  const handleCopyTemplate = () => {
    if (template) {
      navigator.clipboard.writeText(template.commandTemplate);
      toast({ title: 'Copied!', description: 'Command template copied to clipboard.' });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-mono font-bold mb-2">Template Not Found</h2>
        <p className="text-muted-foreground mb-4">This template doesn't exist or has been removed.</p>
        <Link to="/templates"><Button className="bg-primary text-primary-foreground font-mono">Browse Templates</Button></Link>
      </div>
    );
  }

  const stars = Math.round(template.ratings?.averageRating || 0);
  const diffClass = difficultyClasses[template.difficulty] || '';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/templates" className="hover:text-primary">Templates</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-48">{template.name}</span>
        </nav>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {template.isFeatured && (
                      <Badge className="bg-warning/20 text-warning border-warning/30 text-xs font-mono">
                        <Shield className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold">{template.name}</h1>
                  <p className="text-muted-foreground font-mono text-sm mt-1">{template.category}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTemplate}
                  className="shrink-0 border-border hover:border-primary/50 font-mono"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </Button>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs border font-mono ${diffClass}`}>
                  {template.difficulty}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs border font-mono bg-secondary text-muted-foreground border-border">
                  <Terminal className="h-3 w-3 mr-1.5" />
                  {template.tool}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs border font-mono bg-secondary text-muted-foreground border-border">
                  <Globe className="h-3 w-3 mr-1.5" />
                  {template.targetSystem}
                </span>
                {template.attackProtocol && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs border font-mono bg-primary/10 text-primary border-primary/30">
                    {template.attackProtocol}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-foreground/80 leading-relaxed">{template.description}</p>
              {template.longDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{template.longDescription}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="flex justify-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <p className="text-lg font-bold font-mono">{(template.ratings?.averageRating || 0).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{template.ratings?.totalRatings || 0} ratings</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <Eye className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold font-mono">{(template.viewCount || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <Zap className="h-4 w-4 text-accent mx-auto mb-1" />
                <p className="text-lg font-bold font-mono">{template.requiredFields?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Fields</p>
              </div>
            </div>

            {/* Command template */}
            <div>
              <h3 className="text-sm font-mono font-semibold mb-2 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Command Template
              </h3>
              <div className="terminal-block rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-terminal font-mono break-all">
                  {template.commandTemplate}
                </code>
              </div>
            </div>

            {/* Tags */}
            {template.tags?.length > 0 && (
              <div>
                <h3 className="text-sm font-mono font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/templates?search=${tag}`}
                      className="text-xs font-mono px-2 py-1 bg-muted/50 rounded border border-border hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author info */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-sm font-mono font-bold">
                  {template.createdBy?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Created by</p>
                <p className="text-sm font-mono font-semibold">{template.createdBy?.username}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-1 mb-1 justify-end">
                  <Calendar className="h-3 w-3" />
                  {template.publishedAt ? new Date(template.publishedAt).toLocaleDateString() : new Date(template.createdAt).toLocaleDateString()}
                </div>
                {template.isPrivate && (
                  <Badge className="bg-warning/20 text-warning border-warning/30 font-mono text-xs">
                    🔒 Private
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Ratings section */}
            <div>
              <h3 className="text-base font-mono font-semibold mb-4">Reviews & Ratings</h3>
              {(() => {
                // Find user's existing rating and comment
                const userRatingData = template.recentRatings?.find(r => r.userId === user?._id) ||
                                      template.recentRatings?.find(r => r._id && template.ratings?.userRating); // Fallback
                return (
                  <RatingForm 
                    templateId={template._id} 
                    userRating={template.ratings?.userRating}
                    userComment={userRatingData?.comment}
                  />
                );
              })()}
              <div className="mt-4">
                <RatingList ratings={template.recentRatings || []} />
              </div>
            </div>
          </div>

          {/* Right Panel - Command Generator */}
          <div className="lg:col-span-2">
            <CommandGenerator template={template} />
          </div>
        </div>

        {/* Similar templates */}
        {similarData?.data && similarData.data.length > 0 && (
          <div className="mt-12">
            <h3 className="text-base font-mono font-semibold mb-4">Similar Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarData.data.slice(0, 3).map(t => (
                <TemplateCard key={t._id} template={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDetail;
