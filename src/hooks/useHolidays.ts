// 공휴일 데이터 fetch + 캐시 관리 hook
import { useState, useEffect } from 'react';
import { fetchHolidays, getCachedHolidays } from '@/utils/holidays';

export function useHolidays(year: number, month: number) {
  // 12월이면 다음 해도 필요할 수 있음 (결제일이 다음 달로 밀릴 경우)
  const years = month === 12 ? [year, year + 1] : [year];

  const [holidays, setHolidays] = useState<string[]>(() => {
    return years.flatMap((y) => getCachedHolidays(y));
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const results = await Promise.all(years.map((y) => fetchHolidays(y)));
      if (!cancelled) {
        setHolidays(results.flat());
        setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  return { holidays, isLoading };
}
