import { Star, User } from 'lucide-react';
import type { RatingEntry } from '@/types/template';

interface RatingListProps {
  ratings: RatingEntry[];
}

const RatingList: React.FC<RatingListProps> = ({ ratings }) => {
  if (!ratings || ratings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6 font-mono">
        No reviews yet. Be the first to rate!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {ratings.map((rating) => (
        <div key={rating._id} className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-xs font-mono font-bold">
                  {rating.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-mono text-foreground">{rating.username}</span>
            </div>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < rating.score ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
          </div>
          {rating.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed">{rating.comment}</p>
          )}
          <p className="text-xs text-muted-foreground/50 mt-2 font-mono">
            {new Date(rating.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default RatingList;
