import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  RotateCw,
  Edit,
  Building2,
  FileText,
  User,
  Calendar,
  Scale,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Sparkles,
} from 'lucide-react';
import { PurchasingDocument, DocumentLink } from '../types';
import {
  formatCurrency,
  formatDateThai,
  formatDateTimeThai,
  getDocLabel,
  getCategoryBadgeClass,
  getDocTypeBadgeClass,
  normalizeMatchKey,
} from '../utils/formatters';
import { ACCOUNTING_DOC_TYPES, BTC_COMPANY_INFO } from '../data/constants';

interface DocumentDetailModalProps {
  document: PurchasingDocument | null;
  allDocuments: PurchasingDocument[];
  links: DocumentLink[];
  onClose: () => void;
  onOpenEdit: (doc: PurchasingDocument) => void;
  onReanalyze: (doc: PurchasingDocument) => void;
  isReanalyzing: boolean;
  onLinkDocument: (poDocKey: string, linkDocKey: string) => void;
  onUnlinkDocument: (poDocKey: string, linkDocKey: string) => void;
  onConfirmLink: (link: DocumentLink) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: doc,
  allDocuments,
  links,
  onClose,
  onOpenEdit,
  onReanalyze,
  isReanalyzing,
  onLinkDocument,
  onUnlinkDocument,
  onConfirmLink,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'matching'>('info');
  const [matchStoreFilter, setMatchStoreFilter] = useState('');

  if (!doc) return null;

  const isPO = doc.doc_type === 'ใบสั่งซื้อ';
  const accountingMeta = ACCOUNTING_DOC_TYPES.find((t) => t.name === doc.doc_type);

  // Links for this document
  const currentPoLinks = links.filter((l) => l.po_doc_key === doc.doc_key);
  const currentDocAsLink = links.filter((l) => l.link_doc_key === doc.doc_key);

  // For POs: find candidate sub-documents (delivery slips, weigh tickets, invoices)
  const candidateDocs = allDocuments.filter((d) => {
    if (d.id === doc.id) return false;
    if (d.doc_type === 'ใบสั่งซื้อ') return false;
    if (currentPoLinks.some((l) => l.link_doc_key === d.doc_key)) return false;
    return true;
  });

  const filteredCandidates = matchStoreFilter
    ? candidateDocs.filter((c) => c.store_name === matchStoreFilter)
    : candidateDocs;

  // Attached weight tickets comparison (if this is a delivery note and has attached weigh tickets)
  const attachedWeighTickets = allDocuments.filter((d) => {
    const isWeigh = Boolean(d.doc_type && (d.doc_type.includes('ชั่ง') || d.doc_type === 'WT'));
    if (!isWeigh) return false;
    if (d.ref_no && doc.doc_no && normalizeMatchKey(d.ref_no) === normalizeMatchKey(doc.doc_no)) {
      return true;
    }
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <span className="bg-[#27AE60] text-white text-xs px-2.5 py-1 rounded-md font-bold tracking-wide">
              BTC เอกสารจัดซื้อ
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 truncate">
              {doc.store_name} — {getDocLabel(doc)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split View Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left Column: Document Image Preview */}
          <div className="lg:w-[38%] shrink-0 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col gap-2.5 min-h-0">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#27AE60]" />
                <span>ภาพถ่ายบิล / เอกสารต้นฉบับ</span>
              </span>
              {doc.image_url && (
                <a
                  href={doc.image_original_url || doc.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-[#27AE60] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>เปิดรูปขนาดเต็ม</span>
                </a>
              )}
            </div>

            <div className="flex-1 min-h-[220px] lg:min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2">
              {doc.image_url ? (
                <img
                  src={doc.image_url}
                  alt={doc.store_name}
                  className="w-full h-full object-contain max-h-[50vh] lg:max-h-[68vh] rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-400 p-8 space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs">ไม่มีไฟล์ภาพบิล</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              บันทึกเข้าระบบ: {formatDateTimeThai(doc.timestamp)}
            </div>
          </div>

          {/* Right Column: Information & Matching Tabs */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-white">
            {/* Header Tabs */}
            <div className="px-5 pt-3 pb-2 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 bg-slate-50/40">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'info'
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ข้อมูลเอกสาร
                </button>
                {isPO && (
                  <button
                    onClick={() => setActiveTab('matching')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      activeTab === 'matching'
                        ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#27AE60]" />
                    <span>จับคู่เอกสารรับของ</span>
                    {currentPoLinks.length > 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                        {currentPoLinks.length}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Re-read AI Button */}
              <button
                onClick={() => onReanalyze(doc)}
                disabled={isReanalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#27AE60] text-xs font-semibold rounded-lg border border-slate-200 transition shadow-xs disabled:opacity-50"
                title="ให้ AI ทำการสแกนและอ่านข้อมูลจากรูปภาพนี้ใหม่อีกครั้ง"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-[#27AE60]' : ''}`} />
                <span>{isReanalyzing ? 'AI กำลังอ่าน...' : 'อ่านใหม่ (AI)'}</span>
              </button>
            </div>

            {/* Tab 1: Detailed Information */}
            {activeTab === 'info' && (
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                {/* BTC Header Card */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white p-1 rounded-xl shadow-xs border border-emerald-200 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-[#27AE60]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {BTC_COMPANY_INFO.nameTh}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {BTC_COMPANY_INFO.address} • เลขผู้เสียภาษี: {BTC_COMPANY_INFO.taxId}
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#27AE60] text-white text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                    เอกสารฝ่ายจัดซื้อ
                  </span>
                </div>

                {/* Primary Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">เลขที่เอกสาร:</span>
                    <span className="font-bold text-slate-900">{getDocLabel(doc)}</span>
                    {doc.po_number && doc.po_number !== '-' && (
                      <span className="text-[10px] text-blue-700 block font-mono mt-1">
                        PO: {doc.po_number}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">วันที่ในบิล:</span>
                    <span className="font-semibold text-slate-800">{formatDateThai(doc.date)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">หมวดหมู่:</span>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeClass(
                        doc.category
                      )}`}
                    >
                      {doc.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">ผู้ส่งบิล (LINE):</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-[#27AE60]" />
                      <span>{doc.sender_name || 'ไม่ทราบชื่อ'}</span>
                    </span>
                  </div>
                </div>

                {/* Accounting Classification Badge */}
                {accountingMeta && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        [{accountingMeta.code}]
                      </span>
                      <span className="font-bold text-slate-800">{accountingMeta.name}</span>
                      <span className="text-slate-500 text-[11px]">({accountingMeta.group})</span>
                    </div>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      {accountingMeta.vat}
                      {accountingMeta.legalSection && ` • อ้างอิง ${accountingMeta.legalSection}`}
                    </p>
                  </div>
                )}

                {/* Project & Purchaser Info Box */}
                {(doc.company_name || doc.job_name || doc.requester || doc.pay_approver) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">🏢 ชื่อบริษัท (ผู้ซื้อ):</span>
                      <span className="font-bold text-slate-800">
                        {doc.company_name || BTC_COMPANY_INFO.nameTh}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">🚧 งาน / โครงการ:</span>
                      <span className="font-semibold text-slate-800">
                        {doc.job_name || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">🙋 ผู้ขอเบิก:</span>
                      <span className="font-semibold text-slate-800">
                        {doc.requester || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">💳 ผู้สั่งจ่าย:</span>
                      <span className="font-semibold text-slate-800">
                        {doc.pay_approver || '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Weighbridge Box */}
                {((doc.doc_type && doc.doc_type.includes('ชั่ง')) || doc.scale_weight_net) && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">🚚 ทะเบียนรถ:</span>
                      <span className="font-bold text-slate-900">
                        {doc.vehicle_registration || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">⬇️ น้ำหนักเข้า:</span>
                      <span className="font-semibold text-slate-800">
                        {doc.scale_weight_in ? `${doc.scale_weight_in} ตัน` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">⬆️ น้ำหนักออก:</span>
                      <span className="font-semibold text-slate-800">
                        {doc.scale_weight_out ? `${doc.scale_weight_out} ตัน` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">⚖️ น้ำหนักสุทธิ:</span>
                      <span className="font-bold text-sky-800 text-sm">
                        {doc.scale_weight_net ? `${doc.scale_weight_net} ตัน` : '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Attached Weigh Tickets Comparison */}
                {attachedWeighTickets.length > 0 && (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-600" />
                        <span>ใบชั่งน้ำหนักที่แนบกับบิลนี้ ({attachedWeighTickets.length} ใบ)</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ตรวจจับคู่จากเลขอ้างอิง
                      </span>
                    </div>
                    {attachedWeighTickets.map((wt) => (
                      <div
                        key={wt.id}
                        className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">
                          {wt.doc_no} {wt.vehicle_registration && `(${wt.vehicle_registration})`}
                        </span>
                        <span className="font-bold text-sky-800">
                          {wt.scale_weight_net ? `${wt.scale_weight_net} ตัน` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Line Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#27AE60]" />
                      <span>ตารางรายละเอียดสินค้า / วัสดุก่อสร้าง</span>
                    </h5>
                    <span className="text-[11px] bg-emerald-50 text-[#27AE60] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      {doc.items.length} รายการ
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-2.5 w-12 text-center">ลำดับ</th>
                          <th className="p-2.5">รายการสินค้า / วัสดุ</th>
                          <th className="p-2.5 text-center">จำนวน</th>
                          <th className="p-2.5 text-center">หน่วย</th>
                          <th className="p-2.5 text-right">ราคา / หน่วย</th>
                          <th className="p-2.5 text-right">ราคารวม (บาท)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {doc.items.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-800">
                              {sub.name}
                            </td>
                            <td className="p-2.5 text-center font-bold text-slate-900">
                              {sub.quantity}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                {sub.unit}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-600">
                              {sub.price_per_unit > 0
                                ? formatCurrency(sub.price_per_unit)
                                : '-'}
                            </td>
                            <td className="p-2.5 text-right font-bold text-[#27AE60] font-mono">
                              {sub.total > 0 ? formatCurrency(sub.total) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-emerald-50/60 border-t-2 border-emerald-200 font-bold text-slate-900">
                        <tr>
                          <td colSpan={5} className="p-3 text-right">
                            ยอดรวมสุทธิ (Grand Total):
                          </td>
                          <td className="p-3 text-right text-[#27AE60] text-sm font-mono">
                            {formatCurrency(doc.total_amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Matching for POs */}
            {activeTab === 'matching' && isPO && (
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Link2 className="w-4 h-4 text-sky-600" />
                    <span>จับคู่ใบสั่งซื้อ (PO) กับบิลส่งของและใบชั่ง</span>
                  </div>
                  <p className="text-sky-700 text-[11px] leading-relaxed">
                    ระบบจะนำบิลส่งของและใบชั่งที่ยังไม่ผูกกับ PO มาให้เลือก
                    หากเลข PO ตรงกัน ระบบจะไฮไลต์คำแนะนำอัตโนมัติ
                  </p>
                </div>

                {/* Store Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">กรองตามร้านค้า:</label>
                  <select
                    value={matchStoreFilter}
                    onChange={(e) => setMatchStoreFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-[#27AE60]"
                  >
                    <option value="">ทุกร้านค้า</option>
                    <option value={doc.store_name}>{doc.store_name} (ร้านเดียวกับ PO)</option>
                  </select>
                </div>

                {/* Candidate List */}
                <div className="space-y-2">
                  <h6 className="text-xs font-bold text-slate-700">
                    เอกสารที่สามารถจับคู่ได้ ({filteredCandidates.length})
                  </h6>
                  {filteredCandidates.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                      ไม่มีเอกสารที่รอจับคู่สำหรับเงื่อนไขนี้
                    </div>
                  ) : (
                    filteredCandidates.map((cand) => {
                      const isExactMatch =
                        cand.po_number === doc.po_number ||
                        cand.ref_no === doc.po_number ||
                        cand.ref_no === doc.doc_no;
                      return (
                        <div
                          key={cand.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                            isExactMatch
                              ? 'bg-sky-50/60 border-sky-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-slate-900">
                                {getDocLabel(cand)}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border ${getDocTypeBadgeClass(
                                  cand.doc_type
                                )}`}
                              >
                                {cand.doc_type}
                              </span>
                              {isExactMatch && (
                                <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>ตรงรหัส PO 98%</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              {cand.store_name} • วันที่: {formatDateThai(cand.date)}
                              {cand.scale_weight_net && ` • น้ำหนัก: ${cand.scale_weight_net} ตัน`}
                            </div>
                            <div className="text-xs font-bold text-[#27AE60] mt-0.5">
                              {formatCurrency(cand.total_amount)}
                            </div>
                          </div>

                          <button
                            onClick={() => onLinkDocument(doc.doc_key, cand.doc_key)}
                            className="px-3 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white text-xs font-semibold rounded-lg transition shrink-0"
                          >
                            จับคู่กับ PO นี้
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Already Linked List */}
                {currentPoLinks.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <h6 className="text-xs font-bold text-slate-700">
                      เอกสารที่จับคู่แล้ว ({currentPoLinks.length})
                    </h6>
                    {currentPoLinks.map((link) => {
                      const isPending = link.status === 'pending';
                      return (
                        <div
                          key={link.link_doc_key}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {link.link_label || link.link_doc_key}
                            </span>
                            <span
                              className={`ml-2 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                                isPending
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {isPending ? 'รอตรวจสอบ' : 'ยืนยันแล้ว'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isPending && (
                              <button
                                onClick={() => onConfirmLink(link)}
                                className="px-2.5 py-1 bg-[#27AE60] hover:bg-[#219653] text-white text-xs font-semibold rounded-lg transition"
                              >
                                ยืนยัน
                              </button>
                            )}
                            <button
                              onClick={() => onUnlinkDocument(doc.doc_key, link.link_doc_key)}
                              className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border border-slate-200 text-xs font-semibold rounded-lg transition"
                            >
                              ยกเลิกคู่
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Action Bar */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="text-xs text-slate-500 truncate">
                Doc Key: <span className="font-mono text-slate-700">{doc.doc_key}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEdit(doc)}
                  className="px-3.5 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อมูลบิล</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
