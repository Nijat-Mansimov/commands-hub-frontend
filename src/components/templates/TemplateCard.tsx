import { Link } from 'react-router-dom';
import { Star, Copy, Terminal, Shield, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Template } from '@/types/template';
import { toast } from '@/hooks/use-toast';

interface TemplateCardProps {
  template: Template;
  onCopy?: (id: string) => void;
}

const difficultyClasses: Record<string, string> = {
  Beginner: 'difficulty-beginner',
  Intermediate: 'difficulty-intermediate',
  Advanced: 'difficulty-advanced',
  Expert: 'difficulty-expert',
};

const targetClasses: Record<string, string> = {
  Windows: 'target-windows',
  Linux: 'target-linux',
  'Active Directory': 'target-ad',
  'Web Application': 'target-web',
  Network: 'target-network',
  Cloud: 'target-cloud',
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const handleCopyCommand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(template.commandTemplate);
    toast({ title: 'Template copied!', description: 'Command template copied to clipboard.' });
  };

  const diffClass = difficultyClasses[template.difficulty] || 'difficulty-beginner';
  const targetClass = targetClasses[template.targetSystem] || 'target-network';
  const stars = Math.round(template.ratings?.averageRating || 0);

  return (
    <Card className="group bg-card border-border hover:border-primary/30 transition-all duration-200 hover:shadow-[0_0_15px_hsl(195_100%_50%/0.1)] cursor-pointer flex flex-col">
      <Link to={`/templates/${template._id}`} className="flex flex-col flex-1">
        <CardContent className="p-5 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                {template.category}
              </p>
            </div>
            {template.isFeatured && (
              <Shield className="h-4 w-4 text-warning shrink-0" />
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {template.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-mono ${diffClass}`}>
              {template.difficulty}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-mono ${targetClass}`}>
              {template.targetSystem}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs border font-mono bg-secondary text-muted-foreground border-border">
              <Terminal className="h-3 w-3 mr-1" />
              {template.tool}
            </span>
            {template.isPrivate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs border font-mono bg-warning/10 text-warning border-warning/30">
                🔒 Private
              </span>
            )}
          </div>

          {/* Tags */}
          {template.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded font-mono">
                  #{tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{template.tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < stars ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <span>({template.ratings?.totalRatings || 0})</span>
            </div>
            {/* Views */}
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{(template.viewCount || 0).toLocaleString()}</span>
            </div>
          </div>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            @{template.createdBy?.username}
          </div>
        </CardFooter>
      </Link>

      {/* Copy button - outside Link */}
      <div className="px-5 pb-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-border hover:border-primary/50 hover:text-primary font-mono"
          onClick={handleCopyCommand}
        >
          <Copy className="h-3 w-3 mr-1.5" />
          Copy Template
        </Button>
      </div>
    </Card>
  );
};

export default TemplateCard;
