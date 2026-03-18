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
import { useIncomeStore } from '@/stores/useIncomeStore';
import { useSnapshotStore } from '@/stores/useSnapshotStore';
import { useTransferStatusStore } from '@/stores/useTransferStatusStore';
import { exportData, importData } from '@/utils/dataExport';
import { APP_VERSION } from '@/utils/constants';

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountStore = useAccountStore();
  const cardStore = useCardStore();
  const billStore = useBillStore();
  const incomeStore = useIncomeStore();
  const snapshotStore = useSnapshotStore();

  const handleExport = () => {
    const data = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      accounts: accountStore.accounts,
      cards: cardStore.cards,
      bills: billStore.bills,
      incomes: incomeStore.incomes,
      snapshots: snapshotStore.snapshots,
    };
    const filename = `cashpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    exportData(data, filename);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importData(file) as Record<string, unknown>;

      if (Array.isArray(data.accounts)) {
        useAccountStore.setState({ accounts: data.accounts as never });
      }
      if (Array.isArray(data.cards)) {
        useCardStore.setState({ cards: data.cards as never });
      }
      if (Array.isArray(data.bills)) {
        useBillStore.setState({ bills: data.bills as never });
      }
      if (Array.isArray(data.incomes)) {
        useIncomeStore.setState({ incomes: data.incomes as never });
      }
      if (Array.isArray(data.snapshots)) {
        useSnapshotStore.setState({ snapshots: data.snapshots as never });
      }

      alert('데이터를 성공적으로 가져왔습니다!');
    } catch {
      alert('데이터 가져오기에 실패했습니다. 파일 형식을 확인해 주세요.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 모든 데이터 초기화 (이체 상태 포함)
  const handleReset = () => {
    accountStore.reset();
    cardStore.reset();
    billStore.reset();
    incomeStore.reset();
    snapshotStore.reset();
    useTransferStatusStore.getState().reset();
  };

  return (
    <div className="space-y-2.5">
      <div className="glass-elevated rounded-2xl divide-y divide-border/30">
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 p-4 text-left text-sm font-medium transition-colors hover:bg-muted/30 first:rounded-t-2xl"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
            <Download className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p>데이터 내보내기</p>
            <p className="text-[11px] text-muted-foreground font-normal">JSON 파일로 백업</p>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center gap-3 p-4 text-left text-sm font-medium transition-colors hover:bg-muted/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
            <Upload className="h-4 w-4 text-emerald-500" />
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
            <button className="flex w-full items-center gap-3 p-4 text-left text-sm font-medium transition-colors hover:bg-rose-500/5 last:rounded-b-2xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10">
                <RotateCcw className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <p className="text-rose-600 dark:text-rose-400">모든 데이터 초기화</p>
                <p className="text-[11px] text-muted-foreground font-normal">되돌릴 수 없습니다</p>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>모든 데이터를 초기화할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                모든 계좌, 카드, 청구서, 수입, 히스토리 데이터가 영구적으로 삭제됩니다.
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
