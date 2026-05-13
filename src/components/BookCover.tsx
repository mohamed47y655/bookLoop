import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

type BookCoverProps = {
  src: string;
  title: string;
  author?: string;
  className?: string;
  imageClassName?: string;
  loading?: 'eager' | 'lazy';
};

export default function BookCover({
  src,
  title,
  author,
  className,
  imageClassName,
  loading = 'lazy',
}: BookCoverProps) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) {
    return (
      <div
        className={cn(
          'relative flex h-full w-full flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.28),transparent_34%),linear-gradient(145deg,hsl(var(--muted)/0.82),hsl(var(--background)))] p-5',
          className,
        )}
        role="img"
        aria-label={title}
      >
        <div className="flex items-center justify-between text-primary/80">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
          <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-primary/70">
            BookLoop
          </span>
        </div>
        <div className="space-y-2">
          <p className="font-display text-lg font-bold leading-tight text-foreground line-clamp-4">
            {title}
          </p>
          {author && <p className="text-xs text-muted-foreground line-clamp-2">by {author}</p>}
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary/70">Cover unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className={cn('h-full w-full object-cover', className, imageClassName)}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
