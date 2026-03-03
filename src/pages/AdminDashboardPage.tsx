import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, Eye, Trash2, LayoutDashboard, Terminal, Users, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useAdminStats } from '@/hooks/useTemplates';
import { templatesService } from '@/services/templates';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const AdminDashboardPage = () => {
  const { data, isLoading } = useAdminStats();
  const queryClient = useQueryClient();
  const stats = data?.data;
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      if (featured) {
        await templatesService.unfeature(id);
        toast({ title: 'Template unfeatured' });
      } else {
        await templatesService.feature(id);
        toast({ title: 'Template featured!' });
      }
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await templatesService.delete(deleteId);
      toast({ title: 'Template deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const StatCard = ({ icon: Icon, value, label, color }: { icon: any; value: any; label: string; color: string }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono">
            {isLoading ? <Skeleton className="h-7 w-16" /> : (value?.toLocaleString() ?? '–')}
          </div>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-warning/20 border border-warning/30 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono">
              <span className="text-gradient-primary">Admin</span> Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">Platform management & statistics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Terminal} value={stats?.totalTemplates} label="Total Templates" color="bg-primary/20 text-primary" />
          <StatCard icon={Shield} value={stats?.totalPublished} label="Published" color="bg-terminal/20 text-terminal" />
          <StatCard icon={Eye} value={stats?.totalUsageCount} label="Total Uses" color="bg-accent/20 text-accent" />
          <StatCard icon={Users} value={stats?.totalUsers} label="Total Users" color="bg-warning/20 text-warning" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Used */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Top Used Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))
                ) : (stats?.topUsed || []).slice(0, 8).map((t, i) => (
                  <div key={t._id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                      <Link to={`/templates/${t._id}`} className="text-sm truncate hover:text-primary transition-colors">
                        {t.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs font-mono text-muted-foreground">{t.usageCount?.toLocaleString()}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeature(t._id, t.isFeatured)}
                        className={`h-6 px-2 text-xs font-mono ${t.isFeatured ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
                      >
                        <Shield className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(t._id)}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Rated */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Award className="h-4 w-4 text-warning" />
                Top Rated Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))
                ) : (stats?.topRated || []).slice(0, 8).map((t, i) => (
                  <div key={t._id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                      <Link to={`/templates/${t._id}`} className="text-sm truncate hover:text-primary transition-colors">
                        {t.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        {(t.ratings?.averageRating || 0).toFixed(1)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeature(t._id, t.isFeatured)}
                        className={`h-6 px-2 text-xs font-mono ${t.isFeatured ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
                      >
                        <Shield className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(t._id)}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Templates */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent" />
                Recently Added
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))
                ) : (stats?.recentTemplates || []).slice(0, 6).map(t => (
                  <div key={t._id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/templates/${t._id}`} className="text-sm font-mono hover:text-primary transition-colors truncate">
                          {t.name}
                        </Link>
                        {t.isFeatured && (
                          <Badge className="bg-warning/20 text-warning border-warning/30 text-xs shrink-0">Featured</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {t.category} • @{t.author?.username} • {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeature(t._id, t.isFeatured)}
                        className={`h-7 px-2 text-xs font-mono ${t.isFeatured ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
                      >
                        <Shield className="h-3.5 w-3.5 mr-1" />
                        {t.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(t._id)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono">Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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

export default AdminDashboardPage;
