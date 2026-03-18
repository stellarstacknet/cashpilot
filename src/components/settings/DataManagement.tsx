import { useRef } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const handleReset = () => {
    accountStore.reset();
    cardStore.reset();
    billStore.reset();
    incomeStore.reset();
    snapshotStore.reset();
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">데이터 관리</h3>

      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={handleExport} className="rounded-lg">
          <Download className="mr-2 h-4 w-4" /> 데이터 내보내기 (JSON)
        </Button>

        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-lg">
          <Upload className="mr-2 h-4 w-4" /> 데이터 가져오기 (JSON)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="rounded-lg">
              <RotateCcw className="mr-2 h-4 w-4" /> 모든 데이터 초기화
            </Button>
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

      <p className="text-xs text-muted-foreground">CashPilot v{APP_VERSION}</p>
    </div>
  );
}
