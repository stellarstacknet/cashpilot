// 은행 목록
export const BANKS = [
  '신한은행',
  'KB국민은행',
  '우리은행',
  '하나은행',
  'NH농협은행',
  'IBK기업은행',
  '카카오뱅크',
  '토스뱅크',
  'SC제일은행',
  '씨티은행',
  '새마을금고',
  '기타',
] as const;

// 카드사 목록
export const CARD_ISSUERS = [
  '삼성카드',
  '현대카드',
  '신한카드',
  'KB국민카드',
  '롯데카드',
  '하나카드',
  '우리카드',
  'NH농협카드',
  'BC카드',
  '카카오뱅크',
  '기타',
] as const;

// 카드 색상 프리셋
export const CARD_COLORS: string[] = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
];

// 카드사별 브랜드 색상
export const CARD_ISSUER_COLORS: Record<string, string> = {
  '삼성카드': '#0EA5E9',   // 하늘색
  '현대카드': '#1C1C1E',   // 블랙
  '신한카드': '#2563EB',   // 파란색
  'KB국민카드': '#D4A017',  // 골드
  '롯데카드': '#9CA3AF',   // 라이트그레이 (흰색 대체, 흰 배경에서 보이도록)
  '하나카드': '#10B981',   // 에메랄드
  '우리카드': '#1D4ED8',   // 진파랑
  'NH농협카드': '#16A34A', // 초록
  'BC카드': '#DC2626',     // 빨강
  '카카오뱅크': '#FDE047', // 노랑
  '기타': '#6B7280',       // 회색
};

// 은행별 브랜드 색상
export const BANK_COLORS: Record<string, string> = {
  '신한은행': '#0046FF',
  'KB국민은행': '#FFB300',
  '우리은행': '#0066B3',
  '하나은행': '#00856A',
  'NH농협은행': '#02A54F',
  'IBK기업은행': '#005BAC',
  '카카오뱅크': '#FFCD00',
  '토스뱅크': '#0064FF',
  'SC제일은행': '#00AF4D',
  '씨티은행': '#003EA4',
  '새마을금고': '#0072BC',
  '기타': '#6B7280',
};

// 계좌 용도 라벨
export const ACCOUNT_PURPOSE_LABELS: Record<string, string> = {
  salary: '급여통장',
  card_payment: '카드결제',
  savings: '저축',
  general: '일반',
};

// 은행 로고 경로 (public/logos/)
export const BANK_LOGOS: Record<string, string> = {
  '신한은행': '/logos/shinhanbank.png',
  'KB국민은행': '/logos/kb.png',
  '우리은행': '/logos/woori.png',
  '하나은행': '/logos/hana.png',
  '토스뱅크': '/logos/tossbank.png',
  '새마을금고': '/logos/mgbank.png',
};

// 카드사 로고 경로 (public/logos/)
export const CARD_LOGOS: Record<string, string> = {
  '삼성카드': '/logos/samsungcard.png',
  '현대카드': '/logos/hyundaicard.png',
  '신한카드': '/logos/shinhancard.png',
  'KB국민카드': '/logos/kbcard.png',
  '롯데카드': '/logos/lottecard.png',
  '하나카드': '/logos/hanacard.png',
  'BC카드': '/logos/bccard.png',
};

// 앱 버전
export const APP_VERSION = '1.0.0';
