import { Link } from 'react-router-dom';
import { Shield, Terminal, Search, ArrowRight, Star, Eye, Zap, Lock, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import TemplateCard from '@/components/templates/TemplateCard';
import { useFeaturedTemplates, usePopularTemplates, usePublicStats } from '@/hooks/useTemplates';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedTemplates();
  const { data: popularData, isLoading: popularLoading } = usePopularTemplates();
  const { data: statsData, isLoading: statsLoading } = usePublicStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/templates?search=${encodeURIComponent(search)}`);
  };

  const featuredTemplates = featuredData?.data?.slice(0, 8) || [];
  const popularTemplates = popularData?.data?.slice(0, 4) || [];

  // Build stats with real data from database
  const stats = [
    { 
      icon: Database, 
      label: 'Attack Templates', 
      value: statsData?.data?.templates ? `${statsData.data.templates}+` : 'Loading...',
      isLoading: statsLoading
    },
    { 
      icon: Terminal, 
      label: 'Categories', 
      value: statsData?.data?.mainCategories ? `${statsData.data.mainCategories}+` : 'Loading...',
      isLoading: statsLoading
    },
    { 
      icon: Zap, 
      label: 'Subcategories', 
      value: statsData?.data?.subcategories ? `${statsData.data.subcategories}+` : 'Loading...',
      isLoading: statsLoading
    },
    { 
      icon: Lock, 
      label: 'Security Pros', 
      value: statsData?.data?.users ? `${statsData.data.users}+` : 'Loading...',
      isLoading: statsLoading
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-grid overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge className="bg-primary/10 text-primary border-primary/30 font-mono mb-6 inline-flex">
            <Terminal className="h-3 w-3 mr-1.5" /> Professional Attack Payload Repository
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            <span className="text-gradient-primary">Attack Payload</span>
            <br />
            <span className="text-foreground">Command Repository</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Community-driven platform for security professionals to share, discover, and generate
            attack command payloads for penetration testing and security research.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search: kerberoasting, SQL injection, port scan..."
                className="pl-10 bg-card border-border font-mono text-sm h-11 focus:border-primary/50"
              />
            </div>
            <Button type="submit" className="bg-primary text-primary-foreground font-mono h-11 px-6">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/templates">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono gap-2">
                Explore Templates <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/templates/create">
              <Button variant="outline" className="border-border hover:border-primary/50 font-mono gap-2">
                <Shield className="h-4 w-4" /> Create Template
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value, isLoading: itemLoading }) => (
              <div key={label} className="text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                {itemLoading ? (
                  <>
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold font-mono text-gradient-primary">{value}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold font-mono">
                <span className="text-gradient-primary">Featured</span> Templates
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Hand-picked high-quality payloads</p>
            </div>
            <Link to="/templates?sort=topRated">
              <Button variant="ghost" size="sm" className="font-mono text-primary hover:text-primary/80 gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTemplates.map(t => <TemplateCard key={t._id} template={t} />)}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground font-mono text-sm">No featured templates yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Connect your backend API to display templates.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Popular Templates */}
      {(popularLoading || popularTemplates.length > 0) && (
        <section className="py-12 bg-card/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold font-mono">
                  <span className="text-gradient-primary">Trending</span> This Week
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Most used in the last 7 days</p>
              </div>
              <Link to="/templates?sort=mostUsed">
                <Button variant="ghost" size="sm" className="font-mono text-primary gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {popularLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularTemplates.map(t => <TemplateCard key={t._id} template={t} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Terminal className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-mono mb-3">
            Share Your <span className="text-gradient-primary">Expertise</span>
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Contribute to the community by creating and sharing your attack command templates.
          </p>
          <Link to="/register">
            <Button className="bg-primary text-primary-foreground font-mono gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
