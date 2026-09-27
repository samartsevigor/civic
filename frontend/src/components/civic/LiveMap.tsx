'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Issue } from '@/lib/types/issue';

const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="empty">Loading map…</div> },
);

export function LiveMap({
  issues,
  large = false,
}: {
  issues: Issue[];
  large?: boolean;
}) {
  const router = useRouter();
  return (
    <div
      className={large ? 'large-map' : 'mini-map'}
      style={{ height: large ? 640 : 242 }}
    >
      <MapView
        issues={issues}
        className="h-full w-full"
        onIssueSelect={(issue) => router.push(`/issue/${issue.id}`)}
      />
    </div>
  );
}
