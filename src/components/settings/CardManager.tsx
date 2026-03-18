import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCardStore } from '@/stores/useCardStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { CARD_ISSUERS, CARD_ISSUER_COLORS } from '@/utils/constants';
import { cn } from '@/lib/utils';

export function CardManager() {
  const { cards, addCard, updateCard, deleteCard, toggleActive } = useCardStore();
  const accounts = useAccountStore((s) => s.accounts);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    issuer: '',
    paymentDay: '15',
    linkedAccountId: '',
  });

  const resetForm = () => {
    setForm({ name: '', issuer: '', paymentDay: '15', linkedAccountId: '' });
    setEditId(null);
  };

  const openAdd = () => { resetForm(); setIsOpen(true); };

  const openEdit = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setForm({
      name: card.name,
      issuer: card.issuer,
      paymentDay: String(card.paymentDay),
      linkedAccountId: card.linkedAccountId,
    });
    setEditId(id);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.issuer || !form.linkedAccountId) return;
    const data = {
      name: form.name || form.issuer,
      issuer: form.issuer,
      paymentDay: parseInt(form.paymentDay) || 15,
      linkedAccountId: form.linkedAccountId,
      overdueRate: 19.9,
      color: CARD_ISSUER_COLORS[form.issuer] || '#6B7280',
      isActive: true,
    };
    if (editId) {
      updateCard(editId, data);
    } else {
      addCard(data);
    }
    setIsOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-2.5">
      {cards.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          등록된 카드가 없습니다.
        </div>
      )}

      {cards.map((card) => (
        <div key={card.id} className={cn('glass-elevated rounded-2xl p-4 press-scale', !card.isActive && 'opacity-45')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[10px] font-bold"
                style={{ backgroundColor: card.color }}
              >
                {card.name.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold">{card.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {card.issuer} · 결제일 {card.paymentDay}일
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => toggleActive(card.id)}
                className={cn(
                  'rounded-lg px-2 py-1 text-[10px] font-bold transition-colors',
                  card.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {card.isActive ? 'ON' : 'OFF'}
              </button>
              <button onClick={() => openEdit(card.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteCard(card.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={openAdd}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border/50 p-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
      >
        <Plus className="h-4 w-4" /> 카드 추가
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? '카드 수정' : '카드 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>카드사</Label>
              <Select value={form.issuer} onValueChange={(v) => setForm({ ...form, issuer: v })}>
                <SelectTrigger><SelectValue placeholder="카드사 선택" /></SelectTrigger>
                <SelectContent>
                  {CARD_ISSUERS.map((issuer) => (
                    <SelectItem key={issuer} value={issuer}>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CARD_ISSUER_COLORS[issuer] || '#6B7280' }} />
                        {issuer}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>카드 별칭 <span className="text-muted-foreground font-normal">(선택)</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={form.issuer || '비워두면 카드사명 사용'}
              />
            </div>
            <div>
              <Label>결제일 (1-28)</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={form.paymentDay}
                onChange={(e) => setForm({ ...form, paymentDay: e.target.value })}
              />
            </div>
            <div>
              <Label>연결 계좌</Label>
              <Select
                value={form.linkedAccountId}
                onValueChange={(v) => setForm({ ...form, linkedAccountId: v })}
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
