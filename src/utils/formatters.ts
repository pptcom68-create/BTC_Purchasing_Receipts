import { PurchasingDocument, LineItem } from '../types';

export function formatCurrency(amount: number | null | undefined): string {
  const n = Number(amount) || 0;
  return '฿' + n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(val: number | null | undefined, digits: number = 2): string {
  const n = Number(val) || 0;
  return n.toLocaleString('th-TH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDateThai(dateStr?: string | null): string {
  if (!dateStr || dateStr === '-') return '-';
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export function formatDateTimeThai(timestampStr?: string | null): string {
  if (!timestampStr || timestampStr === '-') return '-';
  const parts = timestampStr.trim().split(' ');
  const datePart = parts[0] || '';
  const timePart = parts[1] || '';
  const thaiDate = formatDateThai(datePart);
  const time = timePart ? timePart.slice(0, 5) + ' น.' : '';
  return `${thaiDate} ${time}`.trim();
}

export function getDocLabel(doc: PurchasingDocument | Partial<PurchasingDocument>): string {
  if (!doc) return '-';
  const type = doc.doc_type || '';
  const book = doc.book_no || '';
  const no = doc.doc_no || '';
  const tax = doc.tax_invoice_no || '';
  const ref = doc.ref_no || '';
  const refLabel = doc.ref_label || 'เลขอ้างอิง';

  if (tax) {
    return type ? `${type} ${tax}` : `เลขใบกำกับภาษี ${tax}`;
  } else if (no) {
    return `${type ? type + ' ' : ''}${book ? book + '/' : ''}${no}`;
  } else if (ref) {
    return `${refLabel} ${ref}`;
  } else if (doc.po_number && doc.po_number !== '-') {
    return `PO: ${doc.po_number}`;
  }
  return '-';
}

export function getCategoryBadgeClass(category?: string): string {
  switch (category) {
    case 'วัสดุก่อสร้าง':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'น้ำมันเชื้อเพลิง':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'อุปกรณ์ช่าง':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'ค่าแรง/บริการ':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getDocTypeBadgeClass(docType?: string): string {
  if (!docType) return 'bg-slate-100 text-slate-600 border-slate-200';
  if (docType.includes('กำกับภาษี')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
  }
  if (docType.includes('สั่งซื้อ') || docType === 'PO') {
    return 'bg-blue-50 text-blue-700 border-blue-300 font-semibold';
  }
  if (docType.includes('ชั่ง')) {
    return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
  }
  if (docType.includes('ส่งของ') || docType.includes('ส่งสินค้า')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold';
  }
  if (docType.includes('วางบิล') || docType.includes('แจ้งหนี้')) {
    return 'bg-purple-50 text-purple-700 border-purple-300 font-semibold';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function normalizeMatchKey(str?: string | null): string {
  return String(str || '')
    .toUpperCase()
    .replace(/[\s\-_/\\.,():'"#]+/g, '');
}

export function calculateItemsSummary(items: LineItem[]): string {
  if (!items || items.length === 0) return '-';
  return items
    .map(it => `${it.name || '-'} (${it.quantity || 1} ${it.unit || 'หน่วย'})`)
    .join(', ');
}
