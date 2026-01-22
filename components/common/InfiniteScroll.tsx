'use client';

import { useEffect, useRef } from 'react';

type InfiniteScrollProps = {
  hasMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
};

export function InfiniteScroll({
  hasMore,
  onLoadMore,
  rootMargin = '0px',
}: InfiniteScrollProps) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore, onLoadMore, rootMargin]);

  if (!hasMore) return null;

  return <div ref={loaderRef} className="h-10" />;
}
