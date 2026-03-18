// 계좌 용도
export type AccountPurpose = 'salary' | 'card_payment' | 'savings' | 'general';

// 이체 상태
export type TransferStatus = 'pending' | 'done' | 'skipped';

// 계좌
export interface Account {
  id: string;
  name: string;
  bank: string;
  balance: number;
  purpose: AccountPurpose;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 카드
export interface Card {
  id: string;
  name: string;
  issuer: string;
  paymentDay: number;
  linkedAccountId: string;
  overdueRate: number;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 월별 청구 내역
export interface MonthlyBill {
  id: string;
  cardId: string;
  year: number;
  month: number;
  amount: number;
  isPaid: boolean;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// 수입
export interface Income {
  id: string;
  name: string;
  amount: number;
  depositDay: number;
  accountId: string;
  isConfirmed: boolean;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 이체 플랜 (자동 계산 결과)
export interface TransferPlan {
  id: string;
  year: number;
  month: number;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  dueDate: number;
  priority: number;
  reason: string;
  status: TransferStatus;
}

// 월별 스냅샷 (히스토리용)
export interface MonthlySnapshot {
  id: string;
  year: number;
  month: number;
  totalIncome: number;
  totalBills: number;
  totalSavings: number;
  bills: MonthlyBill[];
  createdAt: string;
}

// 이체 계산 결과
export interface TransferCalculationResult {
  transferPlans: TransferPlan[];
  warnings: string[];
  savingsAvailable: number;
}

// 타임라인 이벤트
export interface TimelineEvent {
  day: number;
  type: 'income' | 'bill';
  label: string;
  amount: number;
  accountName: string;
  accountId: string;
  balanceAfter: number;
  isShortage: boolean;
  color?: string;
}
