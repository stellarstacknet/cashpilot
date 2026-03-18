import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCardStore } from '@/stores/useCardStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useBillStore } from '@/stores/useBillStore';
import { CARD_ISSUERS, CARD_ISSUER_COLORS, CARD_COLORS, getCardLogo } from '@/utils/constants';
import { formatWon } from '@/utils/formatter';
import { cn } from '@/lib/utils';

export function CardManager() {
  const { cards, addCard, updateCard, deleteCard, toggleActive } = useCardStore();
  const accounts = useAccountStore((s) => s.accounts);
  const getBillForCard = useBillStore((s) => s.getBillForCard);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    issuer: '',
    paymentDay: '15',
    linkedAccountId: '',
    color: '',
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const resetForm = () => {
    setForm({ name: '', issuer: '', paymentDay: '15', linkedAccountId: '', color: '' });
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
      color: card.color,
    });
    setEditId(id);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.issuer || !form.linkedAccountId) return;
    const selectedColor = form.color || CARD_ISSUER_COLORS[form.issuer] || '#6B7280';
    const data = {
      name: form.name || form.issuer,
      issuer: form.issuer,
      paymentDay: Math.max(1, Math.min(28, parseInt(form.paymentDay) || 15)),
      linkedAccountId: form.linkedAccountId,
      overdueRate: 19.9,
      color: selectedColor,
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

  const handleIssuerChange = (issuer: string) => {
    setForm({ ...form, issuer, color: CARD_ISSUER_COLORS[issuer] || '' });
  };

  // 연결 계좌명 조회
  const getLinkedAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? account.bank : '';
  };

  return (
    <div className="space-y-3">
      {cards.length === 0 && (
        <div className="card-elevated py-16 text-center">
          <div className="empty-state-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground">
            <Plus className="h-7 w-7 text-background" />
          </div>
          <h3 className="font-display text-base font-bold">카드를 추가하세요</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            카드를 추가하면 청구액 관리를 시작할 수 있어요.
          </p>
        </div>
      )}

      {cards.map((card) => {
        const bill = getBillForCard(card.id, currentYear, currentMonth);
        const linkedName = getLinkedAccountName(card.linkedAccountId);
        const isExpanded = expandedId === card.id;

        return (
          <div
            key={card.id}
            className={cn(
              'card-elevated overflow-hidden transition-opacity',
              !card.isActive && 'opacity-40',
            )}
          >
            <div
              className="flex items-center gap-3.5 p-5 cursor-pointer press-scale"
              onClick={() => setExpandedId(isExpanded ? null : card.id)}
            >
              {getCardLogo(card.issuer) ? (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  <img src={getCardLogo(card.issuer)} alt={card.issuer} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white text-[11px] font-extrabold"
                  style={{ backgroundColor: card.color }}
                >
                  {card.issuer.slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-extrabold truncate">{card.name}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {card.issuer} · {card.paymentDay}일 결제
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-display text-[18px] font-black tabular-nums tracking-tight">
                    {formatWon(bill?.amount || 0)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{currentMonth}월 청구</p>
                </div>
                <ChevronRight className={cn(
                  'h-4 w-4 text-muted-foreground/50 transition-transform duration-200',
                  isExpanded && 'rotate-90',
                )} />
              </div>
            </div>

            {/* 확장 영역: 상세 정보 + 액션 */}
            <div
              className={cn(
                'grid transition-all duration-300 ease-out',
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border/40 bg-muted/30">
                  <div className="px-5 py-3.5 space-y-2.5">
                    {linkedName && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">연결 계좌</span>
                        <span className="font-semibold">{linkedName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex border-t border-border/40">
                    <button
                      onClick={() => toggleActive(card.id)}
                      className="flex-1 py-3 text-[13px] font-bold text-center border-r border-border/40 transition-colors hover:bg-muted/50"
                    >
                      {card.isActive ? 'OFF' : 'ON'}
                    </button>
                    <button
                      onClick={() => openEdit(card.id)}
                      className="flex-1 py-3 text-[13px] font-bold text-center border-r border-border/40 transition-colors hover:bg-muted/50 flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" /> 수정
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
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

      {/* 카드 추가 버튼 */}
      <button
        onClick={openAdd}
        className="flex w-full items-center justify-center gap-1.5 border-2 border-dashed border-border/50 py-5 text-[13px] font-bold text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
      >
        <Plus className="h-4 w-4" /> 카드 추가
      </button>

      {/* 카드 추가/수정 다이얼로그 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? '카드 수정' : '카드 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>카드사</Label>
              <Select value={form.issuer} onValueChange={handleIssuerChange}>
                <SelectTrigger><SelectValue placeholder="카드사 선택" /></SelectTrigger>
                <SelectContent>
                  {CARD_ISSUERS.map((issuer) => (
                    <SelectItem key={issuer} value={issuer}>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5" style={{ backgroundColor: CARD_ISSUER_COLORS[issuer] || '#6B7280' }} />
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
                      {account.bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>카드 색상</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.issuer && CARD_ISSUER_COLORS[form.issuer] && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, color: CARD_ISSUER_COLORS[form.issuer] })}
                    className={cn(
                      'h-8 w-8 transition-all ring-offset-2 ring-offset-background',
                      form.color === CARD_ISSUER_COLORS[form.issuer] && 'ring-2 ring-foreground scale-110',
                    )}
                    style={{ backgroundColor: CARD_ISSUER_COLORS[form.issuer] }}
                    title="카드사 기본 색상"
                  />
                )}
                {CARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={cn(
                      'h-8 w-8 transition-all ring-offset-2 ring-offset-background',
                      form.color === color && 'ring-2 ring-foreground scale-110',
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
