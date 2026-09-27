'use client';

import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { resolveMediaUrl } from '@/lib/api-client';

interface IssueImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function IssueImage({ src, alt, className = 'h-48 w-full object-cover' }: IssueImageProps) {
  const [failed, setFailed] = useState(false);
  const url = resolveMediaUrl(src);

  if (!url || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-500 ${className}`}
      >
        <ImageOff className="mb-2 h-8 w-8" />
        <span className="text-sm">No photo</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
