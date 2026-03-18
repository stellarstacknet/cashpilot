// 대시보드 요약 카드 컴포넌트
// 히어로: 잔여액 메인 + 도넛 차트 + 총자산/청구액 보조
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/utils/formatter';

interface SummaryCardsProps {
  totalBalance: number;
  totalBills: number;
  remaining: number;
}

// 숫자 카운트업 애니메이션 hook
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + diff * ease);
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

// 미니 도넛 차트 (SVG)
function DonutChart({ ratio, size = 72 }: { ratio: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(ratio, 100) / 100) * circumference;
  const gradientId = 'donut-grad';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {ratio > 50 ? (
            <>
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </>
          ) : ratio > 20 ? (
            <>
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fbbf24" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="100%" stopColor="#f87171" />
            </>
          )}
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsla(270, 40%, 80%, 0.15)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export function SummaryCards({
  totalBalance,
  totalBills,
  remaining,
}: SummaryCardsProps) {
  const remainingRatio = totalBalance > 0
    ? Math.max(0, Math.min(((totalBalance - totalBills) / totalBalance) * 100, 100))
    : 0;

  const animatedBalance = useCountUp(totalBalance);
  const animatedBills = useCountUp(totalBills);
  const animatedRemaining = useCountUp(Math.abs(remaining));

  return (
    <div className="space-y-3">
      {/* 히어로 카드 — 잔여액이 메인 */}
      <div className="hero-gradient rounded-[24px] p-6 text-white overflow-hidden">
        <div className="relative z-10">
          {/* 메인: 잔여액 + 도넛 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-white/50/45 tracking-wider uppercase">
                결제 후 잔여
              </p>
              <p className="mt-3 font-display text-[36px] font-extrabold leading-none tracking-tight tabular-nums text-sky-300">
                {formatCurrency(animatedRemaining)}<span className="text-[20px] font-bold text-sky-300/60 ml-1">원</span>
              </p>
            </div>

            {/* 잔여 비율 도넛 차트 */}
            <div className="relative flex items-center justify-center">
              <DonutChart ratio={remainingRatio} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[16px] font-extrabold tabular-nums">
                  {remainingRatio.toFixed(0)}
                </span>
                <span className="text-[9px] font-bold text-white/50/45 -mt-0.5">%</span>
              </div>
            </div>
          </div>

          {/* 보조: 총자산 / 청구액 */}
          <div className="mt-6 grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
            <div>
              <p className="text-[11px] font-semibold text-white/40 tracking-wide">총 자산</p>
              <p className="font-display text-[18px] font-extrabold tabular-nums tracking-tight mt-1 text-white/70">
                {formatCurrency(animatedBalance)}<span className="text-[11px] ml-0.5">원</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 tracking-wide">청구액</p>
              <p className="font-display text-[18px] font-extrabold tabular-nums tracking-tight mt-1 text-red-400">
                -{formatCurrency(animatedBills)}<span className="text-[11px] ml-0.5">원</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
