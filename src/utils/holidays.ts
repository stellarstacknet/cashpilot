// 공휴일 API 연동 (Nager.Date - 무료, CORS 지원)
// 결제일이 주말/공휴일이면 다음 영업일로 보정

const CACHE_KEY = 'cashpilot-holidays';
const API_BASE = 'https://date.nager.at/api/v3/PublicHolidays';

interface HolidayCache {
  [year: number]: string[]; // 'YYYY-MM-DD' 형식
}

// localStorage 캐시에서 공휴일 목록 로드
function loadCache(): HolidayCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: HolidayCache): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// 특정 연도 공휴일 가져오기 (캐시 우선)
export async function fetchHolidays(year: number): Promise<string[]> {
  const cache = loadCache();
  if (cache[year]) return cache[year];

  try {
    const res = await fetch(`${API_BASE}/${year}/KR`);
    if (!res.ok) return [];

    const data: { date: string }[] = await res.json();
    const dates = data.map((h) => h.date);

    cache[year] = dates;
    saveCache(cache);
    return dates;
  } catch {
    return [];
  }
}

// 동기적으로 캐시된 공휴일 반환 (이미 fetch 된 경우)
export function getCachedHolidays(year: number): string[] {
  const cache = loadCache();
  return cache[year] || [];
}

// 날짜가 공휴일인지 확인
function isHoliday(dateStr: string, holidays: string[]): boolean {
  return holidays.includes(dateStr);
}

// 날짜가 주말인지 확인
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// 날짜를 'YYYY-MM-DD' 형식으로 변환
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 결제일을 다음 영업일로 보정
// 주말이나 공휴일이면 다음 날로 밀림 (은행 영업일 기준)
export function adjustToBusinessDay(
  year: number,
  month: number,
  day: number,
  holidays: string[],
): number {
  // 다음 해 공휴일도 필요할 수 있으므로 합침
  const date = new Date(year, month - 1, day);

  let attempts = 0;
  while (attempts < 10) {
    const str = toDateStr(date);
    if (!isWeekend(date) && !isHoliday(str, holidays)) {
      return date.getDate();
    }
    date.setDate(date.getDate() + 1);
    attempts++;
  }

  return day; // fallback
}

// 결제일 보정 + 원래 결제일과 다른지 여부 반환
export function getAdjustedPaymentDay(
  year: number,
  month: number,
  paymentDay: number,
  holidays: string[],
): { adjustedDay: number; isAdjusted: boolean; originalDay: number } {
  const adjustedDay = adjustToBusinessDay(year, month, paymentDay, holidays);
  return {
    adjustedDay,
    isAdjusted: adjustedDay !== paymentDay,
    originalDay: paymentDay,
  };
}
