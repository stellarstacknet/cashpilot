import { useState, useCallback } from 'react';

export function useMonthNavigation() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const goToPrevMonth = useCallback(() => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const isCurrentMonth = year === currentYear && month === currentMonth;
  const isFutureMonth = year > currentYear || (year === currentYear && month >= currentMonth);

  const goToNextMonth = useCallback(() => {
    if (isFutureMonth) return;
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month, isFutureMonth]);

  const goToCurrentMonth = useCallback(() => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
  }, []);

  const canGoNext = !isFutureMonth;

  return {
    year,
    month,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    canGoNext,
  };
}
