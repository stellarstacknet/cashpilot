import { cn } from '@/lib/utils';

// 스켈레톤 로딩 컴포넌트
// 데이터 로딩 중 글래스 카드 형태의 placeholder 표시
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

// 대시보드용 스켈레톤 (히어로 카드 + 2칼럼 카드)
export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-5 w-24 mt-4" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  );
}

// 카드 리스트용 스켈레톤
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}
