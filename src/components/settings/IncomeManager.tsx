import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useIncomeStore } from '@/stores/useIncomeStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { formatWon, formatCurrency, parseAmountInput } from '@/utils/formatter';
import { cn } from '@/lib/utils';

export function IncomeManager() {
  const { incomes, addIncome, updateIncome, deleteIncome, toggleActive } = useIncomeStore();
  const accounts = useAccountStore((s) => s.accounts);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    depositDay: '25',
    accountId: '',
    isConfirmed: true,
    isRecurring: true,
  });

  const resetForm = () => {
    setForm({
      name: '',
      amount: '',
      depositDay: '25',
      accountId: '',
      isConfirmed: true,
      isRecurring: true,
    });
    setEditId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (id: string) => {
    const income = incomes.find((i) => i.id === id);
    if (!income) return;
    setForm({
      name: income.name,
      amount: formatCurrency(income.amount),
      depositDay: String(income.depositDay),
      accountId: income.accountId,
      isConfirmed: income.isConfirmed,
      isRecurring: income.isRecurring,
    });
    setEditId(id);
    setIsOpen(true);
  };

  const handleSave = () => {
    const amount = parseAmountInput(form.amount);
    if (!form.name || !form.accountId || amount <= 0) return;

    const data = {
      name: form.name,
      amount,
      depositDay: parseInt(form.depositDay) || 25,
      accountId: form.accountId,
      isConfirmed: form.isConfirmed,
      isRecurring: form.isRecurring,
      isActive: true,
    };

    if (editId) {
      updateIncome(editId, data);
    } else {
      addIncome(data);
    }
    setIsOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">수입 관리</h3>
        <Button size="sm" onClick={openAdd} className="rounded-lg">
          <Plus className="mr-1 h-4 w-4" /> 추가
        </Button>
      </div>

      {incomes.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">등록된 수입이 없습니다.</p>
      )}

      {incomes.map((income) => (
        <Card key={income.id} className={cn('rounded-xl', !income.isActive && 'opacity-50')}>
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">
                {income.name}
                {!income.isConfirmed && (
                  <span className="ml-1 text-xs text-orange-500">(미확정)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatWon(income.amount)} · 매월 {income.depositDay}일
                {income.isRecurring && ' · 정기'}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => toggleActive(income.id)}>
                <span className="text-xs">{income.isActive ? 'ON' : 'OFF'}</span>
              </Button>
              <Button size="icon" variant="ghost" onClick={() => openEdit(income.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteIncome(income.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? '수입 수정' : '수입 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>이름</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 월급"
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
              <Label>입금일 (1-28)</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={form.depositDay}
                onChange={(e) => setForm({ ...form, depositDay: e.target.value })}
              />
            </div>
            <div>
              <Label>입금 계좌</Label>
              <Select
                value={form.accountId}
                onValueChange={(v) => setForm({ ...form, accountId: v })}
              >
                <SelectTrigger><SelectValue placeholder="계좌 선택" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bank} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isConfirmed}
                  onCheckedChange={(v) => setForm({ ...form, isConfirmed: !!v })}
                />
                확정됨
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isRecurring}
                  onCheckedChange={(v) => setForm({ ...form, isRecurring: !!v })}
                />
                정기 수입
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
