import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, Tv, Phone, Droplets, Package, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFixedExpenseStore } from '@/stores/useFixedExpenseStore';
import { useCardStore } from '@/stores/useCardStore';
import { useAccountStore } from '@/stores/useAccountStore';
import type { FixedExpensePayMethod, FixedExpenseCategory } from '@/types';
import { formatWon, formatCurrency, parseAmountInput } from '@/utils/formatter';
import { getCardLogo, getBankLogo, BANK_COLORS } from '@/utils/constants';
import { cn } from '@/lib/utils';

const PAY_METHOD_LABELS: Record<FixedExpensePayMethod, string> = {
  card: '카드',
  account: '계좌이체',
};

const CATEGORY_LABELS: Record<FixedExpenseCategory, string> = {
  subscription: '구독',
  telecom: '통신비',
  utility: '공과금',
  rental: '렌탈',
  insurance: '보험',
};

const CATEGORY_ICONS: Record<FixedExpenseCategory, React.ComponentType<{ className?: string }>> = {
  subscription: Tv,
  telecom: Phone,
  utility: Droplets,
  rental: Package,
  insurance: Shield,
};

const CATEGORY_COLORS: Record<FixedExpenseCategory, string> = {
  subscription: '#3a9bd5',
  telecom: '#10B981',
  utility: '#F59E0B',
  rental: '#8B5CF6',
  insurance: '#EC4899',
};

export function FixedExpensePage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useFixedExpenseStore();
  const cards = useCardStore((s) => s.cards);
  const accounts = useAccountStore((s) => s.accounts);

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: 'subscription' as FixedExpenseCategory,
    payMethod: 'card' as FixedExpensePayMethod,
    cardId: '',
    accountId: '',
    payDay: '1',
  });

  const totalMonthly = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const categoryBreakdown = useMemo(() => {
    const map = new Map<FixedExpenseCategory, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    }
    return Array.from(map.entries())
      .map(([category, amount]) => ({
        category,
        label: CATEGORY_LABELS[category],
        amount,
        color: CATEGORY_COLORS[category],
        percentage: totalMonthly > 0 ? Math.round((amount / totalMonthly) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalMonthly]);

  const resetForm = () => {
    setForm({ name: '', amount: '', category: 'subscription', payMethod: 'card', cardId: '', accountId: '', payDay: '1' });
    setEditId(null);
  };

  const openAdd = () => { resetForm(); setIsOpen(true); };

  const openEdit = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    setForm({
      name: expense.name,
      amount: formatCurrency(expense.amount),
      category: expense.category,
      payMethod: expense.payMethod,
      cardId: expense.cardId || '',
      accountId: expense.accountId || '',
      payDay: String(expense.payDay),
    });
    setEditId(id);
    setIsOpen(true);
  };

  const handleSave = () => {
    const amount = parseAmountInput(form.amount);
    if (!form.name || amount <= 0) return;
    const payDay = Math.min(31, Math.max(1, parseInt(form.payDay) || 1));

    const shared = {
      name: form.name,
      amount,
      category: form.category,
      payMethod: form.payMethod,
      cardId: form.payMethod === 'card' && form.cardId ? form.cardId : undefined,
      accountId: form.payMethod === 'account' && form.accountId ? form.accountId : undefined,
      payDay,
    };

    if (editId) {
      updateExpense(editId, shared);
    } else {
      addExpense(shared);
    }
    setIsOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteExpense(deleteTarget);
    setDeleteTarget(null);
  };

  const getLinkedCard = (cardId?: string) => {
    if (!cardId) return null;
    return cards.find((c) => c.id === cardId);
  };

  const getLinkedAccount = (accountId?: string) => {
    if (!accountId) return null;
    return accounts.find((a) => a.id === accountId);
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[12px] font-extrabold text-muted-foreground tracking-wider uppercase">FIXED</p>
        <h1 className="text-[22px] font-black tracking-tight mt-0.5">고정비</h1>
      </div>

      {/* 빈 상태 */}
      {expenses.length === 0 && (
        <div className="card-elevated py-16 text-center">
          <div className="empty-state-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground">
            <Plus className="h-7 w-7 text-background" />
          </div>
          <h3 className="font-display text-base font-bold">고정비를 추가하세요</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            매달 고정으로 나가는 비용을 한눈에 관리할 수 있어요.
          </p>
        </div>
      )}

      {/* 카테고리 대시보드 */}
      {expenses.length > 0 && (
        <div className="card-elevated p-5">
          <div className="flex items-center gap-5">
            {/* 파이 차트 */}
            <div className="relative h-[120px] w-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] text-muted-foreground">합계</p>
                <p className="font-display text-[14px] font-black tabular-nums text-[#ffffff]">
                  {formatCurrency(totalMonthly)}
                </p>
              </div>
            </div>

            {/* 카테고리 범례 */}
            <div className="flex-1 space-y-2.5">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[13px] font-bold">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-extrabold tabular-nums">
                      {formatCurrency(item.amount)}원
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 고정비 목록 */}
      {expenses.length > 0 && (
        <section>
          <h2 className="section-label mb-4">항목 목록</h2>
          <div className="space-y-3">
            {expenses.map((expense) => {
              const isExpanded = expandedId === expense.id;
              const CategoryIcon = CATEGORY_ICONS[expense.category];
              const linkedCard = getLinkedCard(expense.cardId);
              const linkedAccount = getLinkedAccount(expense.accountId);

              return (
                <div key={expense.id} className="card-elevated overflow-hidden">
                  <div
                    className="flex items-center gap-3.5 p-5 cursor-pointer press-scale"
                    onClick={() => setExpandedId(isExpanded ? null : expense.id)}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                    >
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-extrabold truncate">{expense.name}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {CATEGORY_LABELS[expense.category]} · 매달 {expense.payDay}일
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-[18px] font-black tabular-nums tracking-tight">
                        {formatWon(expense.amount)}
                      </p>
                      <ChevronRight className={cn(
                        'h-4 w-4 text-muted-foreground/50 transition-transform duration-200',
                        isExpanded && 'rotate-90',
                      )} />
                    </div>
                  </div>

                  {/* 확장 영역 */}
                  <div
                    className={cn(
                      'grid transition-all duration-300 ease-out',
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-border/40 bg-muted/30">
                        <div className="px-5 py-3.5">
                          <div className="flex justify-between text-[12px]">
                            <span className="text-muted-foreground">결제 수단</span>
                            <span className="font-semibold flex items-center gap-1.5">
                              {linkedCard ? (
                                <>
                                  {getCardLogo(linkedCard.issuer) && (
                                    <img src={getCardLogo(linkedCard.issuer)!} alt="" className="h-4 w-4 rounded object-contain" />
                                  )}
                                  {linkedCard.name}
                                </>
                              ) : linkedAccount ? (
                                <>
                                  {getBankLogo(linkedAccount.bank) ? (
                                    <img src={getBankLogo(linkedAccount.bank)!} alt="" className="h-4 w-4 rounded object-contain" />
                                  ) : (
                                    <span
                                      className="inline-flex h-4 w-4 items-center justify-center rounded text-[7px] font-extrabold text-white"
                                      style={{ backgroundColor: BANK_COLORS[linkedAccount.bank] || '#6B7280' }}
                                    >
                                      {linkedAccount.bank.slice(0, 1)}
                                    </span>
                                  )}
                                  {linkedAccount.bank}
                                </>
                              ) : (
                                PAY_METHOD_LABELS[expense.payMethod]
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex border-t border-border/40">
                          <button
                            onClick={() => openEdit(expense.id)}
                            className="flex-1 py-3 text-[13px] font-bold text-center border-r border-border/40 transition-colors hover:bg-muted/50 flex items-center justify-center gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" /> 수정
                          </button>
                          <button
                            onClick={() => setDeleteTarget(expense.id)}
                            className="flex-1 py-3 text-[13px] font-bold text-muted-foreground text-center transition-colors hover:bg-muted/50 flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> 삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 추가 버튼 */}
      <button
        onClick={openAdd}
        className="flex w-full items-center justify-center gap-1.5 border-2 border-dashed border-border/50 py-5 text-[13px] font-bold text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
      >
        <Plus className="h-4 w-4" /> 고정비 추가
      </button>

      {/* 추가/수정 다이얼로그 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? '고정비 수정' : '고정비 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>항목명</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="넷플릭스, 통신비 등"
              />
            </div>
            <div>
              <Label>금액</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => {
                  const amount = parseAmountInput(e.target.value);
                  setForm({ ...form, amount: amount > 0 ? formatCurrency(amount) : '' });
                }}
                placeholder="0"
              />
            </div>
            <div>
              <Label>카테고리</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as FixedExpenseCategory })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>결제 수단</Label>
              <Select
                value={form.payMethod}
                onValueChange={(v) => setForm({ ...form, payMethod: v as FixedExpensePayMethod, cardId: '', accountId: '' })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PAY_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.payMethod === 'card' && cards.length > 0 && (
              <div>
                <Label>결제 카드</Label>
                <Select
                  value={form.cardId}
                  onValueChange={(v) => setForm({ ...form, cardId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="카드 선택" /></SelectTrigger>
                  <SelectContent>
                    {cards.filter((c) => c.isActive).map((card) => (
                      <SelectItem key={card.id} value={card.id}>{card.name} ({card.issuer})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.payMethod === 'account' && accounts.length > 0 && (
              <div>
                <Label>출금 계좌</Label>
                <Select
                  value={form.accountId}
                  onValueChange={(v) => setForm({ ...form, accountId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="계좌 선택" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>결제일</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={form.payDay}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const num = parseInt(val) || 0;
                  setForm({ ...form, payDay: num > 31 ? '31' : val });
                }}
                placeholder="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>고정비를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              이 항목을 삭제하면 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
