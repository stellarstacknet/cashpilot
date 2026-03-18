// ── 계좌 용도 타입 ──
export type AccountPurpose = 'salary' | 'card_payment' | 'savings' | 'general';

// ── 이체 상태 타입 ──
export type TransferStatus = 'pending' | 'done' | 'skipped';

// ── 계좌 인터페이스 ──
export interface Account {
  id: string;
  name: string;          // 계좌 별칭
  bank: string;          // 은행명
  balance: number;       // 현재 잔액
  purpose: AccountPurpose; // 용도 (급여/카드결제/저축/일반)
  sortOrder: number;     // 정렬 순서
  createdAt: string;
  updatedAt: string;
}

// ── 카드 인터페이스 ──
export interface Card {
  id: string;
  name: string;          // 카드 별칭
  issuer: string;        // 카드사
  paymentDay: number;    // 결제일 (1-28)
  linkedAccountId: string; // 연결 계좌 ID
  overdueRate: number;   // 연체이자율
  color: string;         // 카드 표시 색상
  isActive: boolean;     // 활성 여부
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── 월별 청구 내역 인터페이스 ──
export interface MonthlyBill {
  id: string;
  cardId: string;        // 카드 ID
  year: number;          // 청구 연도
  month: number;         // 청구 월
  amount: number;        // 청구 금액
  isPaid: boolean;       // 납부 여부
  memo?: string;         // 메모 (선택)
  createdAt: string;
  updatedAt: string;
}

// ── 수입 인터페이스 ──
// 현재 UI에서 직접 사용하지 않으나, 데이터 import/export 호환을 위해 유지
export interface Income {
  id: string;
  name: string;          // 수입명
  amount: number;        // 금액
  depositDay: number;    // 입금일
  accountId: string;     // 입금 계좌 ID
  isConfirmed: boolean;  // 확정 여부
  isRecurring: boolean;  // 반복 여부
  isActive: boolean;     // 활성 여부
  createdAt: string;
  updatedAt: string;
}

// ── 이체 플랜 인터페이스 (자동 계산 결과) ──
export interface TransferPlan {
  id: string;
  year: number;
  month: number;
  fromAccountId: string; // 출금 계좌 ID
  toAccountId: string;   // 입금 계좌 ID
  amount: number;        // 이체 금액
  dueDate: number;       // 이체 기한일
  priority: number;      // 우선순위 (1이 가장 높음)
  reason: string;        // 이체 사유
  status: TransferStatus; // 처리 상태
}

// ── 월별 스냅샷 인터페이스 (히스토리용) ──
// 현재 UI에서 직접 사용하지 않으나, 데이터 import/export 호환을 위해 유지
export interface MonthlySnapshot {
  id: string;
  year: number;
  month: number;
  totalIncome: number;   // 총 수입
  totalBills: number;    // 총 지출
  totalSavings: number;  // 총 저축
  bills: MonthlyBill[];  // 청구 내역 스냅샷
  createdAt: string;
}

// ── 이체 계산 결과 인터페이스 ──
export interface TransferCalculationResult {
  transferPlans: TransferPlan[]; // 생성된 이체 플랜 목록
  warnings: string[];           // 부족 경고 메시지
  savingsAvailable: number;     // 저축 가능 금액
}

// ── 타임라인 이벤트 인터페이스 ──
export interface TimelineEvent {
  day: number;           // 발생일
  type: 'income' | 'bill'; // 이벤트 유형
  label: string;         // 표시명 (카드명 등)
  amount: number;        // 금액
  accountName: string;   // 계좌명
  accountId: string;     // 계좌 ID
  balanceAfter: number;  // 이벤트 후 잔액
  isShortage: boolean;   // 잔액 부족 여부
  color?: string;        // 표시 색상
}
