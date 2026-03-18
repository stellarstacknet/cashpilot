import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
    setForm({
      name: '',
      issuer: '',
      paymentDay: '15',
      linkedAccountId: '',
    });
    setEditId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsOpen(true);
  };

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">카드 관리</h3>
        <Button size="sm" onClick={openAdd} className="rounded-lg">
          <Plus className="mr-1 h-4 w-4" /> 추가
        </Button>
      </div>

      {cards.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">등록된 카드가 없습니다.</p>
      )}

      {cards.map((card) => (
        <Card key={card.id} className={cn('rounded-xl', !card.isActive && 'opacity-50')}>
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: card.color }} />
              <div>
                <p className="text-sm font-medium">{card.name}</p>
                <p className="text-xs text-muted-foreground">
                  {card.issuer} · 결제일 {card.paymentDay}일
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => toggleActive(card.id)}>
                <span className="text-xs">{card.isActive ? 'ON' : 'OFF'}</span>
              </Button>
              <Button size="icon" variant="ghost" onClick={() => openEdit(card.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteCard(card.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

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
                        <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: CARD_ISSUER_COLORS[issuer] || '#6B7280' }} />
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
