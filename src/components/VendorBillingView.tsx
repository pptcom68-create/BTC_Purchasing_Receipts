import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Paperclip,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { VendorBillingNote, PurchasingDocument, DocumentLink } from '../types';
import { formatCurrency, formatDateThai } from '../utils/formatters';

interface VendorBillingViewProps {
  billingNotes: VendorBillingNote[];
  documents: PurchasingDocument[];
  links: DocumentLink[];
  onCreateBillingNote: (note: Omit<VendorBillingNote, 'id' | 'created_at'>) => void;
  onUpdateStatus: (id: string, status: 'validated' | 'paid' | 'rejected') => void;
}

export const VendorBillingView: React.FC<VendorBillingViewProps> = ({
  billingNotes,
  documents,
  links,
  onCreateBillingNote,
  onUpdateStatus,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [billingNo, setBillingNo] = useState('');
  const [billingDate, setBillingDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimedAmount, setClaimedAmount] = useState('');
  const [selectedReceiptKeys, setSelectedReceiptKeys] = useState<string[]>([]);
  const [taxInvoiceUrl, setTaxInvoiceUrl] = useState('');

  // Get all confirmed matched documents (delivery notes / weigh tickets)
  const confirmedLinks = links.filter((l) => l.status === 'confirmed');
  const candidateDocs = documents.filter((d) =>
    confirmedLinks.some((l) => l.link_doc_key === d.doc_key)
  );

  // Group candidate docs by vendor
  const vendorCandidateDocs = vendorName
    ? candidateDocs.filter((d) => d.store_name === vendorName)
    : candidateDocs;

  const toggleSelectDoc = (docKey: string) => {
    const next = new Set(selectedReceiptKeys);
    if (next.has(docKey)) {
      next.delete(docKey);
    } else {
      next.add(docKey);
    }
    setSelectedReceiptKeys(Array.from(next));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const claimed = parseFloat(claimedAmount) || 0;
    const matchedDocs = documents.filter((d) => selectedReceiptKeys.includes(d.doc_key));
    const matchedSum = matchedDocs.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const diff = Math.abs(claimed - matchedSum);
    const isValid = diff <= 0.01;

    onCreateBillingNote({
      vendor_name: vendorName.trim(),
      billing_no: billingNo.trim() || `VN-${Math.floor(1000 + Math.random() * 9000)}`,
      billing_date: billingDate,
      claimed_amount: claimed,
      matched_amount: matchedSum,
      remaining_amount: Math.max(0, claimed - matchedSum),
      status: isValid ? 'validated' : 'matched',
      validation_ok: isValid,
      validation_message: isValid
        ? 'ยอดใบวางบิลตรงกับบิลส่งของที่จับคู่แล้ว'
        : `ยอดไม่ตรงกัน: ส่วนต่าง ฿${diff.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      receipt_doc_keys: selectedReceiptKeys,
      created_by: 'ฝ่ายการเงิน/จัดซื้อ',
      webview_link: taxInvoiceUrl || undefined,
    });

    // Reset form
    setVendorName('');
    setBillingNo('');
    setClaimedAmount('');
    setSelectedReceiptKeys([]);
    setTaxInvoiceUrl('');
    setShowCreateForm(false);
  };

  const vendorList = Array.from(new Set(candidateDocs.map((d) => d.store_name)));

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>ระบบรับวางบิล &amp; ตรวจสอบใบกำกับภาษี (Vendor Billing)</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
              {billingNotes.length} ใบวางบิล
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบตรวจสอบ 3 ทาง (3-Way Matching): ตรวจสอบยอดเรียกเก็บในใบวางบิลเทียบกับบิลส่งของที่รับจริง
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-lg text-xs font-semibold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreateForm ? 'ปิดฟอร์ม' : 'สร้างใบวางบิลใหม่'}</span>
        </button>
      </div>

      {/* Create New Vendor Billing Form (Expandable) */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="p-5 border-b border-slate-200 bg-amber-50/40 space-y-4 text-xs"
        >
          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-600" />
            <span>สร้างใบวางบิลร้านค้าใหม่ (Create Vendor Billing Note)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลือกร้านค้า / ผู้ขาย:
              </label>
              <select
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="">-- เลือกร้านค้า --</option>
                {vendorList.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลขที่ใบวางบิล:
              </label>
              <input
                type="text"
                value={billingNo}
                onChange={(e) => setBillingNo(e.target.value)}
                placeholder="เช่น VN-2609-001"
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">วันที่วางบิล:</label>
              <input
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ยอดเงินที่ร้านค้าเรียกเก็บ (บาท):
              </label>
              <input
                type="number"
                step="0.01"
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                placeholder="เช่น 78000"
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Attachment Link */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ลิงก์ใบกำกับภาษี / ภาพใบวางบิล (URL):
            </label>
            <input
              type="url"
              value={taxInvoiceUrl}
              onChange={(e) => setTaxInvoiceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            />
          </div>

          {/* Slips Selection Table */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-700 flex items-center justify-between">
              <span>
                เลือกบิลส่งของ/ใบชั่งที่ยืนยันการรับแล้วเพื่อรวมในใบวางบิลนี้ ({vendorCandidateDocs.length} ใบ)
              </span>
              <span className="font-mono text-emerald-800">
                ยอดที่เลือกแล้ว: ฿
                {documents
                  .filter((d) => selectedReceiptKeys.includes(d.doc_key))
                  .reduce((sum, d) => sum + (d.total_amount || 0), 0)
                  .toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
              {vendorCandidateDocs.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  {vendorName
                    ? 'ไม่พบบิลส่งของที่ยืนยันการรับแล้วของร้านค้านี้'
                    : 'กรุณาเลือกร้านค้าเพื่อแสดงบิลส่งของที่เกี่ยวข้อง'}
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    {vendorCandidateDocs.map((cand) => {
                      const isChecked = selectedReceiptKeys.includes(cand.doc_key);
                      return (
                        <tr
                          key={cand.id}
                          className={`hover:bg-slate-50 cursor-pointer ${
                            isChecked ? 'bg-emerald-50/40' : ''
                          }`}
                          onClick={() => toggleSelectDoc(cand.doc_key)}
                        >
                          <td className="p-2.5 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-[#27AE60] focus:ring-[#27AE60]"
                            />
                          </td>
                          <td className="p-2.5 font-semibold text-slate-800">
                            {cand.doc_no || cand.doc_key}
                          </td>
                          <td className="p-2.5 text-slate-500">
                            {formatDateThai(cand.date)}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {cand.items_summary || cand.doc_type}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-[#27AE60]">
                            {formatCurrency(cand.total_amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={selectedReceiptKeys.length === 0}
              className="px-4 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
            >
              ตรวจสอบและบันทึกใบวางบิล
            </button>
          </div>
        </form>
      )}

      {/* Existing Billing Notes List */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar p-5 space-y-3">
        {billingNotes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="text-sm font-semibold text-slate-600">ยังไม่มีใบวางบิลในระบบ</h4>
            <p className="text-xs text-slate-400">
              กดปุ่ม "สร้างใบวางบิลใหม่" เพื่อทำการรวมบิลส่งของที่ยืนยันแล้วและตรวจสอบยอด 3 ทาง
            </p>
          </div>
        ) : (
          billingNotes.map((note) => {
            const isValidated = note.validation_ok;
            const isPaid = note.status === 'paid';
            return (
              <div
                key={note.id}
                className={`p-4 rounded-xl border transition shadow-xs space-y-3 ${
                  isValidated
                    ? 'bg-white border-slate-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {note.vendor_name}
                      </span>
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {note.billing_no}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isValidated
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isPaid
                          ? '✓ อนุมัติจ่ายแล้ว'
                          : isValidated
                          ? '✓ ยอดตรวจสอบผ่าน'
                          : 'รอตรวจยอดส่วนต่าง'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      วันที่วางบิล: {formatDateThai(note.billing_date)} • ผู้บันทึก:{' '}
                      {note.created_by}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">ยอดที่ร้านค้าเรียกเก็บ</div>
                    <div className="font-bold text-base font-mono text-slate-900">
                      {formatCurrency(note.claimed_amount)}
                    </div>
                  </div>
                </div>

                {/* Validation message box */}
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 ${
                    isValidated
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100/70 text-amber-900 border border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isValidated ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{note.validation_message}</span>
                  </div>
                  <div className="text-[11px] font-mono">
                    ยอดรวมบิลที่แนบ: {formatCurrency(note.matched_amount)}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    {note.webview_link && (
                      <a
                        href={note.webview_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#27AE60] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เปิดใบกำกับภาษี</span>
                      </a>
                    )}
                    <span className="text-slate-400">
                      ({note.receipt_doc_keys.length} บิลที่ผูกไว้)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isValidated && !isPaid && (
                      <button
                        onClick={() => onUpdateStatus(note.id, 'paid')}
                        className="px-3 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white font-semibold rounded-lg shadow-xs transition"
                      >
                        อนุมัติจ่ายเงิน
                      </button>
                    )}
                    {!isPaid && (
                      <button
                        onClick={() => onUpdateStatus(note.id, 'rejected')}
                        className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 font-semibold rounded-lg transition"
                      >
                        ปฏิเสธ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
