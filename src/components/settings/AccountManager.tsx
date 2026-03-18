import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAccountStore } from '@/stores/useAccountStore';
import type { AccountPurpose } from '@/types';
import { BANKS, ACCOUNT_PURPOSE_LABELS } from '@/utils/constants';
import { formatWon, parseAmountInput, formatCurrency } from '@/utils/formatter';

export function AccountManager() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccountStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    bank: '',
    balance: '',
    purpose: 'general' as AccountPurpose,
  });

  const resetForm = () => {
    setForm({ name: '', bank: '', balance: '', purpose: 'general' });
    setEditId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsOpen(true);
  };

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
      updateAccount(editId, {
        name,
        bank: form.bank,
        balance,
        purpose: form.purpose,
      });
    } else {
      addAccount({
        name,
        bank: form.bank,
        balance,
        purpose: form.purpose,
      });
    }
    setIsOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">계좌 관리</h3>
        <Button size="sm" onClick={openAdd} className="rounded-lg">
          <Plus className="mr-1 h-4 w-4" /> 추가
        </Button>
      </div>

      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">등록된 계좌가 없습니다.</p>
      )}

      {accounts.map((account) => (
        <Card key={account.id} className="rounded-xl">
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">{account.name}</p>
              <p className="text-xs text-muted-foreground">
                {account.bank} · {ACCOUNT_PURPOSE_LABELS[account.purpose]} · {formatWon(account.balance)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(account.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteAccount(account.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

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
    </div>
  );
}
