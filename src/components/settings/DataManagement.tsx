// 데이터 관리 컴포넌트
// JSON 내보내기(백업), 가져오기(복원), 전체 초기화 기능
import { useRef } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { useTransferStatusStore } from '@/stores/useTransferStatusStore';
import { useFixedExpenseStore } from '@/stores/useFixedExpenseStore';
import { exportData, importData } from '@/utils/dataExport';
import { APP_VERSION } from '@/utils/constants';
import { dbSaveAccounts, dbSaveCards, dbSaveFixedExpenses, dbSaveBill } from '@/lib/db';
import type { Account, Card, MonthlyBill, FixedExpense } from '@/types';

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountStore = useAccountStore();
  const cardStore = useCardStore();
  const billStore = useBillStore();

  const handleExport = () => {
    const data = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      accounts: accountStore.accounts,
      cards: cardStore.cards,
      bills: billStore.bills,
      fixedExpenses: useFixedExpenseStore.getState().expenses,
    };
    const filename = `cashpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    exportData(data, filename);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importData(file) as Record<string, unknown>;

      // 1단계: 계좌 먼저 저장 (다른 테이블이 참조)
      if (Array.isArray(data.accounts)) {
        const accounts = data.accounts as Account[];
        useAccountStore.setState({ accounts });
        await dbSaveAccounts(accounts);
      }

      // 2단계: 카드 저장 (계좌 참조, 청구서가 참조)
      if (Array.isArray(data.cards)) {
        const cards = data.cards as Card[];
        useCardStore.setState({ cards });
        await dbSaveCards(cards);
      }

      // 3단계: 청구서 + 고정비 병렬 저장
      const promises: Promise<void>[] = [];
      if (Array.isArray(data.bills)) {
        const bills = data.bills as MonthlyBill[];
        useBillStore.setState({ bills });
        for (const bill of bills) promises.push(dbSaveBill(bill));
      }
      if (Array.isArray(data.fixedExpenses)) {
        const expenses = data.fixedExpenses as FixedExpense[];
        useFixedExpenseStore.setState({ expenses });
        promises.push(dbSaveFixedExpenses(expenses));
      }
      await Promise.all(promises);

      alert('데이터를 가져오고 서버에 저장했어요!');
    } catch {
      alert('데이터 가져오기에 실패했습니다. 파일 형식을 확인해 주세요.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    accountStore.reset();
    cardStore.reset();
    billStore.reset();
    useTransferStatusStore.getState().reset();
    useFixedExpenseStore.getState().reset();
  };

  return (
    <div className="space-y-2.5">
      <div className="card-elevated divide-y divide-border/30">
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold transition-colors hover:bg-muted/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Download className="h-4 w-4 text-background" />
          </div>
          <div>
            <p>데이터 내보내기</p>
            <p className="text-[11px] text-muted-foreground font-normal">JSON 파일로 백업</p>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold transition-colors hover:bg-muted/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Upload className="h-4 w-4 text-background" />
          </div>
          <div>
            <p>데이터 가져오기</p>
            <p className="text-[11px] text-muted-foreground font-normal">JSON 파일에서 복원</p>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold transition-colors hover:bg-muted/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                <RotateCcw className="h-4 w-4 text-background" />
              </div>
              <div>
                <p className="text-foreground">모든 데이터 초기화</p>
                <p className="text-[11px] text-muted-foreground font-normal">되돌릴 수 없습니다</p>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>모든 데이터를 초기화할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                모든 계좌, 카드, 청구서가 영구 삭제됩니다.
                이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>초기화</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/60 pt-2">
        CashPilot v{APP_VERSION}
      </p>
    </div>
  );
}
