import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, ChevronRight } from 'lucide-react';
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
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import type { AccountPurpose } from '@/types';
import { BANKS, ACCOUNT_PURPOSE_LABELS } from '@/utils/constants';
import { formatWon, parseAmountInput, formatCurrency } from '@/utils/formatter';
import { cn } from '@/lib/utils';

export function AccountManager() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccountStore();
  const cards = useCardStore((s) => s.cards);
  const updateCard = useCardStore((s) => s.updateCard);

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    bank: '',
    balance: '',
    purpose: 'general' as AccountPurpose,
  });

  const linkedCards = deleteTarget
    ? cards.filter((c) => c.linkedAccountId === deleteTarget)
    : [];

  const resetForm = () => {
    setForm({ name: '', bank: '', balance: '', purpose: 'general' });
    setEditId(null);
  };

  const openAdd = () => { resetForm(); setIsOpen(true); };

  const openEdit = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    setForm({
      name: account.name,
      bank: account.bank,
      balance: formatCurrency(account.balance),
      purpose: account.purpose,
    });
    setEditId(id);
    setIsOpen(true);
  };

  const handleSave = () => {
    const balance = parseAmountInput(form.balance);
    if (!form.bank) return;
    const name = form.name || form.bank;
    if (editId) {
      updateAccount(editId, { name, bank: form.bank, balance, purpose: form.purpose });
    } else {
      addAccount({ name, bank: form.bank, balance, purpose: form.purpose });
    }
    setIsOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    for (const card of linkedCards) {
      updateCard(card.id, { isActive: false, linkedAccountId: '' });
    }
    deleteAccount(deleteTarget);
    setDeleteTarget(null);
  };

  // 계좌에 연결된 카드 수 조회
  const getLinkedCardCount = (accountId: string) => {
    return cards.filter((c) => c.linkedAccountId === accountId).length;
  };

  return (
    <div className="space-y-3">
      {accounts.length === 0 && (
        <div className="card-elevated rounded-2xl py-16 text-center">
          <div className="empty-state-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/10">
            <Plus className="h-7 w-7 text-foreground" />
          </div>
          <h3 className="font-display text-base font-semibold">계좌를 등록해주세요</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            계좌를 추가하면 잔액 관리를 시작할 수 있습니다.
          </p>
        </div>
      )}

      {accounts.map((account) => {
        const isExpanded = expandedId === account.id;
        const linkedCount = getLinkedCardCount(account.id);
        const linkedCardNames = cards
          .filter((c) => c.linkedAccountId === account.id)
          .map((c) => c.name);

        return (
          <div key={account.id} className="card-elevated rounded-2xl overflow-hidden">
            <div
              className="px-5 pt-5 pb-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : account.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  {/* 은행 뱃지 */}
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-foreground text-background font-display text-[15px] font-extrabold">
                    {account.bank.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold">{account.name}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {account.bank} · {ACCOUNT_PURPOSE_LABELS[account.purpose]}
                    </p>
                  </div>
                </div>

                <ChevronRight className={cn(
                  'h-4 w-4 text-muted-foreground/50 mt-1 transition-transform duration-200',
                  isExpanded && 'rotate-90',
                )} />
              </div>

              {/* 잔액 */}
              <div className="mt-4 pt-3.5 border-t border-border/40">
                <p className="text-[12px] text-muted-foreground">잔액</p>
                <p className="font-display text-[22px] font-bold tabular-nums tracking-tight mt-1">
                  {formatWon(account.balance)}
                </p>
              </div>
            </div>

            {/* 확장 영역 */}
            {isExpanded && (
              <div className="border-t border-border/40 bg-muted/30">
                {linkedCount > 0 && (
                  <div className="px-5 py-3.5">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-muted-foreground">연결된 카드</span>
                      <span className="font-medium">{linkedCardNames.join(', ')}</span>
                    </div>
                  </div>
                )}

                <div className="flex border-t border-border/40">
                  <button
                    onClick={() => openEdit(account.id)}
                    className="flex-1 py-3 text-[13px] font-semibold text-center border-r border-border/40 transition-colors hover:bg-muted/50 flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" /> 수정
                  </button>
                  <button
                    onClick={() => setDeleteTarget(account.id)}
                    className="flex-1 py-3 text-[13px] font-semibold text-muted-foreground text-center transition-colors hover:bg-muted/50 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 계좌 추가 버튼 */}
      <button
        onClick={openAdd}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border/50 py-5 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
      >
        <Plus className="h-4 w-4" /> 계좌 추가
      </button>

      {/* 계좌 추가/수정 다이얼로그 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? '계좌 수정' : '계좌 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>은행</Label>
              <Select value={form.bank} onValueChange={(v) => setForm({ ...form, bank: v })}>
                <SelectTrigger><SelectValue placeholder="은행 선택" /></SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>계좌 별칭 <span className="text-muted-foreground font-normal">(선택)</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={form.bank || '비워두면 은행명 사용'}
              />
            </div>
            <div>
              <Label>잔액</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={form.balance}
                onChange={(e) => {
                  const amount = parseAmountInput(e.target.value);
                  setForm({ ...form, balance: amount > 0 ? formatCurrency(amount) : '' });
                }}
                placeholder="0"
              />
            </div>
            <div>
              <Label>용도</Label>
              <Select
                value={form.purpose}
                onValueChange={(v) => setForm({ ...form, purpose: v as AccountPurpose })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_PURPOSE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>계좌를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {linkedCards.length > 0 ? (
                <span className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    이 계좌에 연결된 카드 {linkedCards.length}개가 비활성화됩니다.
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {linkedCards.map((c) => c.name).join(', ')}
                  </span>
                </span>
              ) : (
                '이 계좌를 삭제하면 되돌릴 수 없습니다.'
              )}
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
