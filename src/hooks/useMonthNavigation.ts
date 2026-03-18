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

  const goToNextMonth = useCallback(() => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }, []);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const canGoNext = !isCurrentMonth;

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
