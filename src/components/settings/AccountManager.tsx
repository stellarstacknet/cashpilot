import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
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

// 계좌 관리 컴포넌트
// 계좌 추가/수정/삭제, 삭제 시 연결 카드 비활성화 경고 포함
export function AccountManager() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccountStore();
  const cards = useCardStore((s) => s.cards);
  const updateCard = useCardStore((s) => s.updateCard);

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    bank: '',
    balance: '',
    purpose: 'general' as AccountPurpose,
  });

  // 삭제 대상 계좌에 연결된 카드 목록 조회
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

  // 계좌 삭제 확인 처리
  // 연결된 카드가 있으면 자동 비활성화
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    // 연결된 카드를 비활성화 처리
    for (const card of linkedCards) {
      updateCard(card.id, { isActive: false, linkedAccountId: '' });
    }

    deleteAccount(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-2.5">
      {/* 빈 상태 */}
      {accounts.length === 0 && (
        <div className="glass-elevated rounded-2xl py-14 text-center">
          <div className="empty-state-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Plus className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-display text-base font-semibold">계좌를 등록해주세요</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            계좌를 추가하면 잔액 관리를 시작할 수 있습니다.
          </p>
        </div>
      )}

      {/* 계좌 목록 */}
      {accounts.map((account) => (
        <div key={account.id} className="glass-elevated rounded-2xl p-4 press-scale">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-display text-xs font-bold text-primary">
                {account.bank.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold">{account.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {account.bank} · {ACCOUNT_PURPOSE_LABELS[account.purpose]} · {formatWon(account.balance)}
                </p>
              </div>
            </div>
            <div className="flex gap-0.5">
              <button onClick={() => openEdit(account.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(account.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 계좌 추가 버튼 */}
      <button
        onClick={openAdd}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border/50 p-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
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

      {/* 삭제 확인 다이얼로그 (연결 카드 경고 포함) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>계좌를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {linkedCards.length > 0 ? (
                <span className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
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
