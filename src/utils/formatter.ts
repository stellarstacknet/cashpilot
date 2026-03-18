// 금액 포맷 (예: 1234567 → "1,234,567")
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

// 금액 포맷 + 원 단위 (예: "1,234,567원")
export function formatWon(amount: number): string {
  return `${formatCurrency(amount)}원`;
}

// 금액 입력값에서 숫자만 추출
export function parseAmountInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

// 날짜 포맷 (예: "2026년 3월")
export function formatYearMonth(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

// 결제일 포맷 (예: "매월 15일")
export function formatPaymentDay(day: number): string {
  return `매월 ${day}일`;
}

// +/- 부호가 있는 금액 포맷
export function formatSignedAmount(amount: number): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount)}`;
}

// ISO 날짜 문자열 생성
export function nowISO(): string {
  return new Date().toISOString();
}

// UUID 생성
export function generateId(): string {
  return crypto.randomUUID();
}
