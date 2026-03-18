import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/history/TrendChart';
import { CardBreakdown } from '@/components/history/CardBreakdown';
import { MonthlyDetail } from '@/components/history/MonthlyDetail';
import { useSnapshotStore } from '@/stores/useSnapshotStore';
import { cn } from '@/lib/utils';

const RANGE_OPTIONS = [
  { label: '3개월', value: 3 },
  { label: '6개월', value: 6 },
  { label: '12개월', value: 12 },
] as const;

export function HistoryPage() {
  const [range, setRange] = useState(6);
  const allSnapshots = useSnapshotStore((s) => s.snapshots);

  const snapshots = useMemo(() => {
    const now = new Date();
    return allSnapshots
      .filter((s) => {
        const snapshotDate = new Date(s.year, s.month - 1);
        const diffMonths =
          (now.getFullYear() - snapshotDate.getFullYear()) * 12 +
          (now.getMonth() - snapshotDate.getMonth());
        return diffMonths >= 0 && diffMonths < range;
      })
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
  }, [allSnapshots, range]);

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">아직 기록이 없습니다</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          첫 달 데이터가 쌓이면 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {RANGE_OPTIONS.map(({ label, value }) => (
            <Button
              key={value}
              size="sm"
              variant="ghost"
              onClick={() => setRange(value)}
              className={cn(
                'h-7 rounded-md px-3 text-xs font-medium',
                range === value && 'bg-white shadow-sm text-foreground',
                range !== value && 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">수입 vs 지출</h3>
        <div className="rounded-xl border bg-white p-3">
          <TrendChart snapshots={snapshots} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">카드별 추이</h3>
        <div className="rounded-xl border bg-white p-3">
          <CardBreakdown snapshots={snapshots} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">월별 상세</h3>
        <MonthlyDetail snapshots={snapshots} />
      </section>
    </div>
  );
}
