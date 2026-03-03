import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { templatesService } from '@/services/templates';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { Template } from '@/types/template';

interface RatingFormProps {
  templateId: string;
  userRating?: number;
  userComment?: string;
}

const RatingForm: React.FC<RatingFormProps> = ({ templateId, userRating, userComment }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(userRating || 0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState(userComment || '');
  const [submitting, setSubmitting] = useState(false);
  const [hasExistingRating] = useState(!!userRating);

  // Update comment when userComment prop changes (i.e., when fetching updates)
  useEffect(() => {
    if (userComment) {
      setComment(userComment);
    }
  }, [userComment]);

  const handleSubmit = async () => {
    if (score === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await templatesService.rate(templateId, score, comment);
      
      // Optimistic update: update the template cache with new rating data
      queryClient.setQueryData(['template', templateId], (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: response.data, // Use the response data which has updated ratings
        };
      });

      // Also update all list caches that contain this template
      queryClient.setQueryData(['templates/featured'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((t: Template) => 
            t._id === templateId ? response.data : t
          ),
        };
      });

      queryClient.setQueryData(['templates/popular'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((t: Template) => 
            t._id === templateId ? response.data : t
          ),
        };
      });

      const message = hasExistingRating ? 'Rating updated!' : 'Rating submitted!';
      const description = hasExistingRating ? 'Your rating has been updated.' : 'Thanks for your feedback.';
      toast({ title: message, description });
      
      // Only clear comment for new ratings, keep it for updates so user can see what they submitted
      if (!hasExistingRating) {
        setComment('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit rating.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4 text-center">
          <MessageSquare className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">Login</a> to rate this template
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayScore = hoverScore || score;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-mono text-muted-foreground">Rate this template</p>

        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-6 w-6 cursor-pointer transition-colors ${i < displayScore ? 'text-warning fill-warning' : 'text-muted-foreground/30 hover:text-warning/50'}`}
              onMouseEnter={() => setHoverScore(i + 1)}
              onMouseLeave={() => setHoverScore(0)}
              onClick={() => setScore(i + 1)}
            />
          ))}
          {score > 0 && (
            <span className="text-sm text-muted-foreground ml-2 self-center">{score}/5</span>
          )}
        </div>

        <Textarea
          placeholder="Optional: Share your thoughts about this template..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-muted/50 border-border text-sm font-mono resize-none"
          rows={3}
        />

        <Button
          onClick={handleSubmit}
          disabled={submitting || score === 0}
          size="sm"
          className="bg-primary text-primary-foreground font-mono"
        >
          {submitting ? 'Submitting...' : hasExistingRating ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RatingForm;
