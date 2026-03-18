import type {
  Account,
  Card,
  MonthlyBill,
  TransferPlan,
  TransferCalculationResult,
  TimelineEvent,
} from '@/types';
import { generateId } from './formatter';
import { adjustToBusinessDay } from './holidays';

/**
 * 이체 플랜 자동 계산 알고리즘 (계좌 잔액 기반)
 *
 * Step 1: 계좌별 필요 금액 집계
 * Step 2: 계좌 잔액 기준 과부족 판단
 * Step 3: 이체 플랜 생성 (surplus → deficit)
 * Step 4: 전체 부족 처리
 * Step 5: 잔여금 계산
 */
export function calculateTransferPlan(
  accounts: Account[],
  cards: Card[],
  bills: MonthlyBill[],
  year: number,
  month: number,
  holidays: string[] = [],
): TransferCalculationResult {
  const warnings: string[] = [];
  const transferPlans: TransferPlan[] = [];

  const activeCards = cards.filter((c) => c.isActive);
  const monthBills = bills.filter((b) => b.year === year && b.month === month && !b.isPaid);

  // Step 1: 계좌별 필요 금액 집계
  const accountNeeds: Record<string, number> = {};
  const accountCardMap: Record<string, { card: Card; bill: MonthlyBill }[]> = {};

  for (const bill of monthBills) {
    const card = activeCards.find((c) => c.id === bill.cardId);
    if (!card) continue;

    const accountId = card.linkedAccountId;
    accountNeeds[accountId] = (accountNeeds[accountId] || 0) + bill.amount;

    if (!accountCardMap[accountId]) accountCardMap[accountId] = [];
    accountCardMap[accountId].push({ card, bill });
  }

  // Step 2: 계좌 잔액 기준 과부족 판단
  interface AccountGap {
    accountId: string;
    gap: number;
    needed: number;
    effective: number;
  }

  const surplusList: AccountGap[] = [];
  const deficitList: AccountGap[] = [];

  for (const account of accounts) {
    const needed = accountNeeds[account.id] || 0;
    const effective = account.balance;
    const gap = effective - needed;

    const info: AccountGap = { accountId: account.id, gap, needed, effective };

    if (gap >= 0) {
      surplusList.push(info);
    } else {
      deficitList.push(info);
      warnings.push(
        `${account.name}: ${Math.abs(gap).toLocaleString()}원 부족`,
      );
    }
  }

  // Step 3: 이체 플랜 생성
  deficitList.sort((a, b) => {
    const aMaxRate = getMaxOverdueRate(a.accountId, accountCardMap);
    const bMaxRate = getMaxOverdueRate(b.accountId, accountCardMap);
    return bMaxRate - aMaxRate;
  });

  let priority = 1;
  const remainingSurplus: Record<string, number> = {};
  for (const s of surplusList) {
    remainingSurplus[s.accountId] = s.gap;
  }

  for (const deficit of deficitList) {
    const shortfall = Math.abs(deficit.gap);
    let remaining = shortfall;

    for (const surplusId of Object.keys(remainingSurplus)) {
      if (remaining <= 0) break;
      const available = remainingSurplus[surplusId];
      if (available <= 0) continue;

      const transferAmount = Math.min(available, remaining);
      const dueDay = getEarliestDueDay(deficit.accountId, accountCardMap, year, month, holidays);

      const fromAccount = accounts.find((a) => a.id === surplusId);
      const toAccount = accounts.find((a) => a.id === deficit.accountId);
      const cardNames = (accountCardMap[deficit.accountId] || [])
        .map((e) => e.card.name)
        .join(', ');

      transferPlans.push({
        id: generateId(),
        year,
        month,
        fromAccountId: surplusId,
        toAccountId: deficit.accountId,
        amount: transferAmount,
        dueDate: dueDay,
        priority,
        reason: `${cardNames} 결제 (${dueDay}일) - ${fromAccount?.name} → ${toAccount?.name}`,
        status: 'pending',
      });

      remainingSurplus[surplusId] -= transferAmount;
      remaining -= transferAmount;
      priority++;
    }

    // Step 4: 전체 부족 처리
    if (remaining > 0) {
      warnings.push(
        `총 ${remaining.toLocaleString()}원 부족 - 일부 카드 결제가 불가능할 수 있습니다`,
      );
    }
  }

  // Step 5: 잔여금 계산
  const totalBills = monthBills.reduce((sum, b) => sum + b.amount, 0);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsAvailable = Math.max(0, totalBalance - totalBills);

  return { transferPlans, warnings, savingsAvailable };
}

function getMaxOverdueRate(
  accountId: string,
  cardMap: Record<string, { card: Card; bill: MonthlyBill }[]>,
): number {
  const entries = cardMap[accountId] || [];
  if (entries.length === 0) return 0;
  return Math.max(...entries.map((e) => e.card.overdueRate));
}

function getEarliestDueDay(
  accountId: string,
  cardMap: Record<string, { card: Card; bill: MonthlyBill }[]>,
  year: number,
  month: number,
  holidays: string[],
): number {
  const entries = cardMap[accountId] || [];
  if (entries.length === 0) return 28;
  const rawDay = Math.min(28, Math.max(1, Math.min(...entries.map((e) => e.card.paymentDay))));
  return adjustToBusinessDay(year, month, rawDay, holidays);
}

// 타임라인 이벤트 생성 (결제일 영업일 보정 적용)
export function generateTimelineEvents(
  accounts: Account[],
  cards: Card[],
  bills: MonthlyBill[],
  year: number,
  month: number,
  holidays: string[] = [],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const activeCards = cards.filter((c) => c.isActive);
  const monthBills = bills.filter((b) => b.year === year && b.month === month);

  const balances: Record<string, number> = {};
  for (const account of accounts) {
    balances[account.id] = account.balance;
  }

  for (const bill of monthBills) {
    const card = activeCards.find((c) => c.id === bill.cardId);
    if (!card) continue;

    const account = accounts.find((a) => a.id === card.linkedAccountId);
    if (!account) continue;

    const adjustedDay = adjustToBusinessDay(year, month, card.paymentDay, holidays);

    balances[card.linkedAccountId] = (balances[card.linkedAccountId] || 0) - bill.amount;
    const balanceAfter = balances[card.linkedAccountId];

    events.push({
      day: adjustedDay,
      ...(adjustedDay !== card.paymentDay ? { originalDay: card.paymentDay } : {}),
      type: 'bill',
      label: card.name,
      amount: bill.amount,
      accountName: account.name,
      accountId: card.linkedAccountId,
      balanceAfter,
      isShortage: balanceAfter < 0,
      color: card.color,
    });
  }

  events.sort((a, b) => a.day - b.day);
  return events;
}
