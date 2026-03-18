// JSON 데이터 내보내기 (파일 다운로드)
export function exportData(data: Record<string, unknown>, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// JSON 데이터 가져오기 (파일 읽기 + 유효성 검증)
export function importData(file: File): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const validated = validateImportData(data);
        resolve(validated);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// import 데이터 스키마 검증
// 각 필드의 존재 여부와 필수 속성을 검사하여 잘못된 데이터 유입 방지
function validateImportData(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('올바른 CashPilot 백업 파일이 아닙니다.');
  }

  const obj = data as Record<string, unknown>;

  // 계좌 데이터 검증
  if (obj.accounts !== undefined) {
    if (!Array.isArray(obj.accounts)) throw new Error('accounts 데이터가 올바르지 않습니다.');
    for (const a of obj.accounts) {
      if (!a || typeof a !== 'object') throw new Error('잘못된 계좌 데이터가 포함되어 있습니다.');
      const acc = a as Record<string, unknown>;
      if (typeof acc.id !== 'string' || typeof acc.bank !== 'string' || typeof acc.balance !== 'number') {
        throw new Error('계좌 데이터에 필수 필드(id, bank, balance)가 누락되었습니다.');
      }
    }
  }

  // 카드 데이터 검증
  if (obj.cards !== undefined) {
    if (!Array.isArray(obj.cards)) throw new Error('cards 데이터가 올바르지 않습니다.');
    for (const c of obj.cards) {
      if (!c || typeof c !== 'object') throw new Error('잘못된 카드 데이터가 포함되어 있습니다.');
      const card = c as Record<string, unknown>;
      if (typeof card.id !== 'string' || typeof card.issuer !== 'string' || typeof card.paymentDay !== 'number') {
        throw new Error('카드 데이터에 필수 필드(id, issuer, paymentDay)가 누락되었습니다.');
      }
    }
  }

  // 청구서 데이터 검증
  if (obj.bills !== undefined) {
    if (!Array.isArray(obj.bills)) throw new Error('bills 데이터가 올바르지 않습니다.');
    for (const b of obj.bills) {
      if (!b || typeof b !== 'object') throw new Error('잘못된 청구서 데이터가 포함되어 있습니다.');
      const bill = b as Record<string, unknown>;
      if (typeof bill.id !== 'string' || typeof bill.cardId !== 'string' ||
          typeof bill.year !== 'number' || typeof bill.month !== 'number' ||
          typeof bill.amount !== 'number') {
        throw new Error('청구서 데이터에 필수 필드가 누락되었습니다.');
      }
    }
  }

  // 수입 데이터 검증
  if (obj.incomes !== undefined) {
    if (!Array.isArray(obj.incomes)) throw new Error('incomes 데이터가 올바르지 않습니다.');
  }

  // 스냅샷 데이터 검증
  if (obj.snapshots !== undefined) {
    if (!Array.isArray(obj.snapshots)) throw new Error('snapshots 데이터가 올바르지 않습니다.');
  }

  return obj;
}
