# CashPilot - 월간 카드값 분배 대시보드

> **개인용 PWA 웹앱** | 매달 카드 청구액을 확인하고, 계좌 간 이체 플랜을 자동으로 생성해주는 도구

---

## 1. 프로젝트 개요

### 1.1 배경 및 문제 정의

- 매달 여러 카드사 앱을 개별적으로 열어서 청구액을 확인해야 함
- 각 카드의 출금 계좌가 다를 경우, 수동으로 잔고를 확인하고 돈을 분배해야 함
- 토스 등 기존 앱은 실시간 동기화가 부정확하여 실제 금액과 차이가 발생
- 계산 실수로 인한 연체 또는 저축 기회 손실 가능성

### 1.2 솔루션

- 카드별 청구액과 계좌 잔고를 직접 입력하면, **어디서 얼마를 어디로 이체해야 하는지** 자동으로 계산
- 시간축 기반 타임라인으로 **언제 얼마가 부족한지** 시각적으로 확인
- 돈이 부족할 경우 **연체이자 기반 우선순위 분배** 제안
- 월별 히스토리로 **소비 추세 및 저축 가능액** 추적

### 1.3 핵심 원칙

- **서버 없음**: 모든 데이터는 브라우저 로컬에 저장 (개인정보 보호)
- **최소 입력**: 매월 카드 청구액 + 계좌 잔고만 입력 (5분 이내)
- **자동 계산**: 이체 플랜, 부족액 경고, 저축 가능액을 자동 산출
- **개인 전용**: 스토어 출시 불필요, PWA로 본인 폰/PC에서 사용

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React 18+ + TypeScript | 익숙한 스택, 타입 안정성 |
| 빌드 도구 | Vite | 빠른 HMR, PWA 플러그인 지원 |
| 상태관리 | Zustand | 가볍고 직관적, persist 미들웨어 내장 |
| 로컬 저장 | Zustand persist (localStorage) + IndexedDB (히스토리) | 서버 불필요 |
| 차트 | Recharts | React 친화적, 반응형 지원 |
| UI 컴포넌트 | shadcn/ui | 커스터마이징 용이, 포트폴리오 재활용 가능 |
| 스타일링 | Tailwind CSS | shadcn/ui와 통합, 빠른 스타일링 |
| PWA | vite-plugin-pwa | Service Worker 자동 생성, 오프라인 지원 |
| 배포 | Vercel | 무료 호스팅, Git 연동 자동 배포 |
| 아이콘 | Lucide React | shadcn/ui 기본 아이콘 세트 |
| 날짜 처리 | date-fns | 경량, Tree-shakable |

---

## 3. 데이터 모델

### 3.1 계좌 (Account)

```typescript
interface Account {
  id: string;                // UUID
  name: string;              // e.g. "Shinhan Salary Account"
  bank: string;              // e.g. "Shinhan", "Woori", "KB"
  balance: number;           // 현재 잔고 (매월 수동 업데이트)
  purpose: AccountPurpose;   // 계좌 용도
  sortOrder: number;         // 표시 순서
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}

type AccountPurpose = 'salary' | 'card_payment' | 'savings' | 'general';
```

### 3.2 카드 (Card)

```typescript
interface Card {
  id: string;                // UUID
  name: string;              // e.g. "Samsung Card"
  issuer: string;            // e.g. "Samsung", "Hyundai", "Shinhan"
  paymentDay: number;        // 결제일 (1~28)
  linkedAccountId: string;   // 출금 계좌 ID (Account.id 참조)
  overdueRate: number;       // 연체 이자율 (%, e.g. 19.9)
  color: string;             // UI 표시용 HEX 색상 (e.g. "#3B82F6")
  isActive: boolean;         // 활성/비활성 (카드 해지 시 비활성)
  sortOrder: number;         // 표시 순서
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 월별 청구 내역 (MonthlyBill)

```typescript
interface MonthlyBill {
  id: string;                // UUID
  cardId: string;            // Card.id 참조
  year: number;              // e.g. 2026
  month: number;             // 1~12
  amount: number;            // 청구액 (원)
  isPaid: boolean;           // 결제 완료 여부
  memo?: string;             // 메모 (선택)
  createdAt: string;
  updatedAt: string;
}
```

### 3.4 수입 (Income)

```typescript
interface Income {
  id: string;                // UUID
  name: string;              // e.g. "Monthly Salary", "Freelance - Project A"
  amount: number;            // 예상 입금액
  depositDay: number;        // 입금 예정일 (1~28)
  accountId: string;         // 입금 계좌 ID (Account.id 참조)
  isConfirmed: boolean;      // 확정 여부 (프리랜서 입금 등 미확정 가능)
  isRecurring: boolean;      // 매월 반복 여부
  isActive: boolean;         // 활성/비활성
  createdAt: string;
  updatedAt: string;
}
```

### 3.5 이체 플랜 (TransferPlan) - 자동 계산 결과

```typescript
interface TransferPlan {
  id: string;                // UUID
  year: number;
  month: number;
  fromAccountId: string;     // 출금 계좌
  toAccountId: string;       // 입금 계좌
  amount: number;            // 이체 금액
  dueDate: number;           // 이체 기한일 (카드 결제일 기준)
  priority: number;          // 우선순위 (1이 가장 높음, 연체이자율 기반)
  reason: string;            // e.g. "Samsung Card payment (due: 15th)"
  status: TransferStatus;
}

type TransferStatus = 'pending' | 'done' | 'skipped';
```

### 3.6 월별 스냅샷 (MonthlySnapshot) - 히스토리용

```typescript
interface MonthlySnapshot {
  id: string;
  year: number;
  month: number;
  totalIncome: number;       // 총 수입
  totalBills: number;        // 총 청구액
  totalSavings: number;      // 저축 가능액 (수입 - 청구)
  bills: MonthlyBill[];      // 해당 월 청구 내역 복사본
  createdAt: string;
}
```

---

## 4. 화면 구성

### 4.1 Tab 1: Dashboard (메인 화면)

**역할**: 이번 달 재정 상태를 한눈에 파악

**구성 요소**:
- **월 선택기**: 상단에 "2026년 3월" 표시, 좌우 화살표로 월 이동
- **요약 카드 3장**:
  - 총 수입 (확정 + 미확정 구분 표시)
  - 총 청구액
  - 잔여금 (= 수입 - 청구, 저축 가능액)
- **경고 배너**: 잔고 부족 시 빨간색 경고 ("⚠️ Woori Account: 120,000원 insufficient")
- **타임라인 뷰**: 가로축 날짜, 세로로 이벤트 나열
  ```
  3/10  💰 Salary +3,500,000          → Shinhan: 3,500,000
  3/15  💳 Samsung Card -450,000      → KB Account: OK ✅
  3/20  💳 Hyundai Card -620,000      → Woori Account: -120,000 ⚠️
  3/25  💳 Shinhan Card -380,000      → Shinhan: OK ✅
  ──────────────────────────────────
  Remaining: 2,050,000 → Available for savings: 1,500,000
  ```
- **Quick Action 버튼**: "Enter This Month's Bills" → Bills 탭으로 이동

### 4.2 Tab 2: Bills (청구 입력)

**역할**: 매월 카드별 청구액을 빠르게 입력

**구성 요소**:
- 월 선택기 (Dashboard와 연동)
- 등록된 카드 리스트 (카드 색상 + 이름 + 결제일 표시)
- 각 카드 옆에 금액 입력 필드 (숫자 키패드)
- 결제 완료 체크박스
- 하단에 총 청구액 합계 실시간 표시
- "Save" 버튼 → 저장 후 Dashboard 자동 업데이트

**UX 포인트**:
- 이전 달 청구액을 placeholder로 표시 (참고용)
- 금액 입력 시 천 단위 콤마 자동 포맷
- 모든 카드 입력 완료 시 "All bills entered ✅" 표시

### 4.3 Tab 3: Transfer Plan (이체 가이드)

**역할**: 자동 계산된 이체 플랜을 보여주고, 실행 여부를 체크

**구성 요소**:
- 이체 플랜 리스트 (우선순위 순서대로):
  ```
  Priority 1 (High)
  🔴 Shinhan Salary → Woori Account
     Amount: 620,000원
     Due: Before Mar 20
     Reason: Hyundai Card payment
     [Mark as Done]

  Priority 2
  🟢 No transfer needed
     KB Account has sufficient balance for Samsung Card
  ```
- 각 항목에 "Mark as Done" / "Skip" 버튼
- 전체 요약: "Total transfers needed: 2건, 총 820,000원"
- 부족 시 분배 전략 표시:
  ```
  ⚠️ Total shortage: 200,000원
  Recommendation: Pay Samsung Card in full (higher overdue rate: 19.9%)
                  Hyundai Card partial payment: 420,000원 / 620,000원
  ```

### 4.4 Tab 4: History (월별 기록)

**역할**: 과거 데이터 기반 소비 추세 확인

**구성 요소**:
- **기간 선택**: 최근 3개월 / 6개월 / 12개월
- **요약 차트** (Recharts 막대그래프):
  - X축: 월, Y축: 금액
  - 막대 2개: 총 수입 (파란색) vs 총 청구액 (빨간색)
  - 선 그래프: 저축 가능액 추이 (초록색)
- **카드별 청구 추이**: 라인 차트 (카드 색상별)
- **월별 상세 리스트**: 아코디언 형태로 각 월 펼치면 카드별 상세 표시
- **인사이트 문구**: "Compared to last month, total bills decreased by 150,000원"

### 4.5 Tab 5: Settings (설정)

**역할**: 카드/계좌/수입 기본 정보 관리 및 데이터 백업

**구성 요소**:
- **Accounts 관리**: 추가 / 수정 / 삭제 / 순서 변경
- **Cards 관리**: 추가 / 수정 / 비활성화 / 순서 변경
- **Income 관리**: 추가 / 수정 / 비활성화
- **Data Management**:
  - Export (JSON 파일 다운로드)
  - Import (JSON 파일 업로드로 복원)
  - Reset All Data (전체 초기화, 확인 다이얼로그 필수)
- **App Info**: 버전 정보

---

## 5. 핵심 비즈니스 로직

### 5.1 이체 플랜 자동 계산 알고리즘

```
Input:
  - accounts[]: 모든 계좌와 현재 잔고
  - cards[]: 모든 카드 (결제일, 출금계좌, 연체이자율)
  - bills[]: 이번 달 청구 내역
  - incomes[]: 이번 달 수입 (확정분만 계산에 포함)

Process:

  Step 1: 계좌별 필요 금액 집계
    - 각 카드의 청구액을 연결된 출금 계좌별로 그룹핑
    - accountNeeds = { accountId: totalAmountNeeded }

  Step 2: 계좌별 수입 반영
    - 결제일 이전에 입금되는 확정 수입을 해당 계좌 잔고에 가산
    - effectiveBalance = currentBalance + incomingBeforeDueDate

  Step 3: 과부족 판단
    - 각 계좌에 대해: gap = effectiveBalance - totalAmountNeeded
    - gap >= 0 → OK (여유분은 surplus pool에 추가)
    - gap < 0 → 부족 (deficit list에 추가)

  Step 4: 이체 플랜 생성
    - deficit이 있는 계좌에 대해, surplus가 있는 계좌에서 이체 플랜 생성
    - 이체 플랜은 카드 결제일 기준으로 dueDate 설정
    - 우선순위: 연체이자율이 높은 카드의 출금 계좌 부족분 먼저

  Step 5: 전체 부족 처리
    - surplus 총합 < deficit 총합인 경우:
      - 연체이자율 높은 카드부터 풀 결제 할당
      - 남은 금액으로 다음 카드 부분 결제
      - 부분 결제 또는 보류 카드 표시

  Step 6: 잔여금 계산
    - 모든 카드값 처리 후 남은 총 금액 계산
    - savingsAvailable = totalSurplus - totalDeficit
    - 여유분 유지 금액 (설정 가능, 기본값: 0) 제외 후 저축 가능액 표시

Output:
  - transferPlans[]: 이체 플랜 리스트
  - warnings[]: 부족 경고 메시지
  - savingsAvailable: 저축 가능액
```

### 5.2 What-if 시뮬레이션

- 수입 항목의 `isConfirmed`를 토글하면 이체 플랜이 재계산됨
- "만약 프리랜서 입금이 안 들어오면?" → 미확정 수입 제외 후 재계산
- Dashboard와 Transfer Plan이 실시간 연동

### 5.3 월말 스냅샷 자동 저장

- 새로운 월의 데이터를 처음 입력할 때, 이전 월 데이터를 `MonthlySnapshot`으로 자동 저장
- 히스토리 차트에서 사용

---

## 6. 프로젝트 구조

```
cashpilot/
├── public/
│   ├── favicon.ico
│   ├── icon-192.png          # PWA 아이콘
│   └── icon-512.png          # PWA 아이콘
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui 컴포넌트
│   │   ├── layout/
│   │   │   ├── AppShell.tsx          # 전체 레이아웃 (탭 네비게이션 포함)
│   │   │   └── TabNavigation.tsx     # 하단 탭 바
│   │   ├── dashboard/
│   │   │   ├── SummaryCards.tsx       # 수입/청구/잔여금 요약 카드
│   │   │   ├── WarningBanner.tsx      # 부족액 경고 배너
│   │   │   └── Timeline.tsx           # 타임라인 뷰
│   │   ├── bills/
│   │   │   ├── BillInputList.tsx      # 카드별 청구액 입력 리스트
│   │   │   └── BillInputCard.tsx      # 개별 카드 청구액 입력 카드
│   │   ├── transfer/
│   │   │   ├── TransferPlanList.tsx    # 이체 플랜 리스트
│   │   │   ├── TransferPlanItem.tsx    # 개별 이체 플랜 항목
│   │   │   └── ShortageStrategy.tsx   # 부족 시 분배 전략 표시
│   │   ├── history/
│   │   │   ├── TrendChart.tsx         # 수입 vs 청구 추이 차트
│   │   │   ├── CardBreakdown.tsx      # 카드별 청구 추이
│   │   │   └── MonthlyDetail.tsx      # 월별 상세 아코디언
│   │   └── settings/
│   │       ├── AccountManager.tsx     # 계좌 CRUD
│   │       ├── CardManager.tsx        # 카드 CRUD
│   │       ├── IncomeManager.tsx      # 수입 CRUD
│   │       └── DataManagement.tsx     # 백업/복원/초기화
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── BillsPage.tsx
│   │   ├── TransferPlanPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── SettingsPage.tsx
│   ├── stores/
│   │   ├── useAccountStore.ts         # 계좌 상태 관리
│   │   ├── useCardStore.ts            # 카드 상태 관리
│   │   ├── useBillStore.ts            # 청구 내역 상태 관리
│   │   ├── useIncomeStore.ts          # 수입 상태 관리
│   │   └── useSnapshotStore.ts        # 월별 스냅샷 상태 관리
│   ├── hooks/
│   │   ├── useTransferPlan.ts         # 이체 플랜 자동 계산 훅
│   │   ├── useMonthNavigation.ts      # 월 선택 네비게이션 훅
│   │   └── useDashboardSummary.ts     # 대시보드 요약 계산 훅
│   ├── utils/
│   │   ├── calculator.ts              # 이체 플랜 계산 로직
│   │   ├── formatter.ts               # 금액 포맷, 날짜 포맷
│   │   ├── dataExport.ts              # JSON export/import 유틸
│   │   └── constants.ts               # 상수 정의
│   ├── types/
│   │   └── index.ts                   # 전체 타입 정의
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                      # Tailwind 설정
├── index.html
├── vite.config.ts                     # Vite + PWA 설정
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                          # Claude Code용 프로젝트 컨텍스트
```

---

## 7. CLAUDE.md (Claude Code용 핸드오프)

```markdown
# CashPilot - Claude Code Context

## What is this?
개인용 PWA 웹앱. 매달 카드 청구액을 입력하면 계좌 간 이체 플랜을 자동 계산해주는 대시보드.

## Tech Stack
- React 18+ / TypeScript / Vite
- Zustand (persist middleware) for state
- shadcn/ui + Tailwind CSS for UI
- Recharts for charts
- vite-plugin-pwa for PWA
- date-fns for date handling
- Deploy: Vercel

## Key Architecture Decisions
- 100% client-side, no backend. All data in localStorage via Zustand persist.
- IndexedDB for MonthlySnapshot history (larger dataset).
- Transfer plan is computed (derived state), not stored.

## Coding Conventions
- TypeScript strict mode
- Component names: PascalCase
- Store files: use[Name]Store.ts
- Hook files: use[Name].ts
- Comments in Korean where helpful, but code identifiers and UI text in English
- Detailed comments preferred

## Current Status
- [ ] Project scaffolding (Vite + React + TS)
- [ ] shadcn/ui setup
- [ ] Type definitions
- [ ] Zustand stores
- [ ] Core calculation logic (calculator.ts)
- [ ] Dashboard page
- [ ] Bills input page
- [ ] Transfer plan page
- [ ] History page
- [ ] Settings page
- [ ] PWA configuration
- [ ] Vercel deployment
```

---

## 8. 개발 우선순위 (권장 순서)

### Phase 1: Foundation
1. Vite + React + TypeScript 프로젝트 생성
2. shadcn/ui + Tailwind 설정
3. `types/index.ts` 타입 정의
4. Zustand 스토어 구현 (Account, Card, Bill, Income)
5. `calculator.ts` 핵심 로직 구현 + 테스트

### Phase 2: Core UI
6. AppShell + TabNavigation 레이아웃
7. Settings 페이지 (데이터 등록이 먼저 필요하므로)
8. Bills 입력 페이지
9. Transfer Plan 페이지

### Phase 3: Dashboard & Polish
10. Dashboard 페이지 (요약 카드 + 타임라인)
11. History 페이지 (차트)
12. PWA 설정 (manifest, service worker, 아이콘)
13. 데이터 백업/복원 기능

### Phase 4: Deploy
14. Vercel 배포
15. 실사용 테스트 및 버그 수정

---

## 9. 사용 시나리오

```
[최초 1회 - 약 10분]
Settings에서 카드 3장, 계좌 4개, 급여 정보 등록

[매월 1회 - 약 2분]
Bills 탭에서 카드사 앱에서 확인한 청구액 입력

[매월 1회 - 약 1분]
Settings 또는 Dashboard에서 계좌 잔고 업데이트

[자동]
Transfer Plan 자동 생성 → 가이드대로 이체 실행

[자동]
Dashboard에서 잔여금 확인 → 저축 이체
```

**목표: 매월 카드값 관리에 투입되는 시간을 5분 이내로 줄이기**
