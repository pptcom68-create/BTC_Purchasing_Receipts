import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Sparkles,
  Trash2,
  Edit,
  ExternalLink,
  Link2,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Truck,
  Scale,
  Calendar,
  Building,
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
import { ACCOUNTING_DOC_TYPES, DOCUMENT_CATEGORIES } from '../data/constants';

interface DocumentTableProps {
  documents: PurchasingDocument[];
  links: DocumentLink[];
  activeTab: 'all' | 'po' | 'matched';
  onTabChange: (tab: 'all' | 'po' | 'matched') => void;
  onSelectDocument: (doc: PurchasingDocument) => void;
  onEditDocument: (doc: PurchasingDocument) => void;
  onDeleteDocument: (doc: PurchasingDocument) => void;
  onConfirmLink: (link: DocumentLink) => void;
  onRemoveLink: (link: DocumentLink) => void;
  onAutoMatch: () => void;
  customDocTypes: string[];
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  links,
  activeTab,
  onTabChange,
  onSelectDocument,
  onEditDocument,
  onDeleteDocument,
  onConfirmLink,
  onRemoveLink,
  onAutoMatch,
  customDocTypes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAttachments, setShowAttachments] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // Link indices
  const byPoMap = new Map<string, DocumentLink[]>();
  const byLinkMap = new Map<string, DocumentLink[]>();
  links.forEach((l) => {
    if (!byPoMap.has(l.po_doc_key)) byPoMap.set(l.po_doc_key, []);
    byPoMap.get(l.po_doc_key)!.push(l);

    if (!byLinkMap.has(l.link_doc_key)) byLinkMap.set(l.link_doc_key, []);
    byLinkMap.get(l.link_doc_key)!.push(l);
  });

  const toggleExpandRow = (id: string) => {
    const next = new Set(expandedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRowIds(next);
  };

  const toggleExpandAll = () => {
    if (expandedRowIds.size === filteredDocuments.length && filteredDocuments.length > 0) {
      setExpandedRowIds(new Set());
    } else {
      setExpandedRowIds(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  // Base tab filter
  const hasSpecificFilter = Boolean(docTypeFilter || searchQuery.trim() || categoryFilter);
  let tabFiltered = documents;
  if (activeTab === 'po') {
    tabFiltered = documents.filter((d) => d.doc_type === 'ใบสั่งซื้อ');
  } else if (activeTab === 'all') {
    // Normal bills: Not PO and not already confirmed linked as a sub-bill
    // Note: If user is filtering or searching specifically, keep confirmed sub-bills visible so results are not empty
    tabFiltered = documents.filter((d) => {
      if (d.doc_type === 'ใบสั่งซื้อ') return false;
      if (!hasSpecificFilter) {
        const linked = byLinkMap.get(d.doc_key);
        if (linked && linked.some((l) => l.status === 'confirmed')) return false;
      }
      return true;
    });
  }

  // Search & Filter
  const now = new Date();
  const filteredDocuments = tabFiltered.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.po_number.toLowerCase().includes(q) ||
      item.store_name.toLowerCase().includes(q) ||
      (item.sender_name && item.sender_name.toLowerCase().includes(q)) ||
      (item.doc_no && item.doc_no.toLowerCase().includes(q)) ||
      (item.tax_invoice_no && item.tax_invoice_no.toLowerCase().includes(q)) ||
      (item.ref_no && item.ref_no.toLowerCase().includes(q)) ||
      (item.company_name && item.company_name.toLowerCase().includes(q)) ||
      (item.job_name && item.job_name.toLowerCase().includes(q)) ||
      (item.items_summary && item.items_summary.toLowerCase().includes(q)) ||
      item.items.some(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          sub.unit.toLowerCase().includes(q)
      );

    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    // Flexible doc_type matcher (matches full statutory names, codes, or common abbreviations)
    const matchesDocType = (() => {
      if (!docTypeFilter) return true;
      if (item.doc_type === docTypeFilter) return true;
      const cleanItem = (item.doc_type || '').replace(/[\s\-_/\\.,():'"#]+/g, '');
      const cleanFilter = docTypeFilter.replace(/[\s\-_/\\.,():'"#]+/g, '');
      if (cleanItem === cleanFilter || cleanItem.includes(cleanFilter) || cleanFilter.includes(cleanItem)) {
        return true;
      }
      if (docTypeFilter.includes('ชั่ง') && (item.doc_type || '').includes('ชั่ง')) return true;
      if (
        docTypeFilter.includes('ส่งของ') &&
        (item.doc_type || '').includes('ส่งของ') &&
        !docTypeFilter.includes('กำกับภาษี') &&
        !(item.doc_type || '').includes('กำกับภาษี')
      ) {
        return true;
      }
      if (docTypeFilter.includes('กำกับภาษี') && (item.doc_type || '').includes('กำกับภาษี')) return true;
      return false;
    })();

    let matchesDate = true;
    if (item.date && item.date !== '-') {
      const itemDate = new Date(item.date);
      if (!isNaN(itemDate.getTime())) {
        if (dateFilter === 'today') {
          matchesDate = itemDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'month') {
          matchesDate =
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'year') {
          matchesDate = itemDate.getFullYear() === now.getFullYear();
        }
      }
    }

    return matchesSearch && matchesCategory && matchesDocType && matchesDate;
  });

  // Calculate tab badge counts
  const allBillsCount = documents.filter((d) => {
    if (d.doc_type === 'ใบสั่งซื้อ') return false;
    const linked = byLinkMap.get(d.doc_key);
    if (linked && linked.some((l) => l.status === 'confirmed')) return false;
    return true;
  }).length;
  const poCount = documents.filter((d) => d.doc_type === 'ใบสั่งซื้อ').length;
  const matchedCount = links.filter((l) => l.status === 'confirmed').length;
  const pendingMatchCount = links.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            บิลทั้งหมด
            <span className="ml-1.5 text-[10px] font-semibold bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-full">
              {allBillsCount}
            </span>
          </button>
          <button
            onClick={() => onTabChange('po')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'po'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ใบสั่งซื้อ (PO)
            <span className="ml-1.5 text-[10px] font-semibold bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-full">
              {poCount}
            </span>
          </button>
          <button
            onClick={() => onTabChange('matched')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'matched'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            บิลที่จับคู่แล้ว
            <span className="ml-1.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full border border-emerald-200">
              {matchedCount}
            </span>
            {pendingMatchCount > 0 && (
              <span className="ml-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-300">
                รอตรวจ {pendingMatchCount}
              </span>
            )}
          </button>
        </div>

        {/* Auto Match Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAutoMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold border border-sky-200 transition"
            title="ค้นหาคู่ความสัมพันธ์ระหว่าง PO กับ ใบส่งของ/ใบชั่ง โดยอัตโนมัติ"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>หาคู่ให้อัตโนมัติ</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="px-4 py-2.5 flex flex-col md:flex-row gap-2.5 items-center justify-between border-b border-slate-100">
        {/* Search */}
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา PO, ร้านค้า, สินค้า, ผู้ส่ง, เลขที่เอกสาร..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#27AE60] transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#27AE60]"
          >
            <option value="">ทุกหมวดหมู่</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Doc Type Filter */}
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#27AE60]"
          >
            <option value="">ทุกประเภทเอกสาร</option>
            {ACCOUNTING_DOC_TYPES.map((t) => (
              <option key={t.name} value={t.name}>
                [{t.code}] {t.name}
              </option>
            ))}
            {customDocTypes.map((c) => (
              <option key={c} value={c}>
                [CUSTOM] {c}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#27AE60]"
          >
            <option value="all">ทุกช่วงเวลา</option>
            <option value="today">วันนี้</option>
            <option value="month">เดือนนี้</option>
            <option value="year">ปีนี้</option>
          </select>

          {/* Expand all button */}
          <button
            onClick={toggleExpandAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>
              {expandedRowIds.size === filteredDocuments.length && filteredDocuments.length > 0
                ? 'ย่อทุกแถว'
                : 'ขยายทุกแถว'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
        {activeTab === 'matched' ? (
          /* Matched PO Pairs View */
          <div className="p-4 space-y-4">
            {links.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Link2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">
                  ยังไม่มีคู่บิลที่จับคู่แล้ว
                </p>
                <p className="text-xs text-slate-400">
                  ไปที่แท็บ "ใบสั่งซื้อ" แล้วเลือก "ดูบิลเต็ม" จากนั้นเข้าสู่แถบ "จับคู่"
                  เพื่อจับคู่บิลส่งของหรือใบชั่งกับใบสั่งซื้อ
                </p>
              </div>
            ) : (
              documents
                .filter((d) => d.doc_type === 'ใบสั่งซื้อ' && byPoMap.has(d.doc_key))
                .map((po) => {
                  const poLinks = byPoMap.get(po.doc_key) || [];
                  const pendingCount = poLinks.filter((l) => l.status === 'pending').length;
                  const confirmedCount = poLinks.length - pendingCount;
                  return (
                    <div
                      key={po.id}
                      className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white"
                    >
                      {/* PO Header Bar */}
                      <div
                        className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b ${
                          pendingCount > 0
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-emerald-50/70 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            ใบสั่งซื้อหลัก
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {po.po_number}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs text-slate-700 font-semibold">
                            {po.store_name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ยอดรวม {formatCurrency(po.total_amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {pendingCount > 0 && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold border border-amber-300">
                              ⏳ รอตรวจสอบ {pendingCount} ใบ
                            </span>
                          )}
                          {confirmedCount > 0 && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
                              ✓ จับคู่แล้ว {confirmedCount} ใบ
                            </span>
                          )}
                          <button
                            onClick={() => onSelectDocument(po)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
                          >
                            ดู PO
                          </button>
                        </div>
                      </div>

                      {/* Matched Sub-slips */}
                      <div className="p-3 space-y-2 bg-slate-50/30">
                        {poLinks.map((link) => {
                          const linkedDoc = documents.find(
                            (d) => d.doc_key === link.link_doc_key
                          );
                          const isPending = link.status === 'pending';
                          return (
                            <div
                              key={`${link.po_doc_key}-${link.link_doc_key}`}
                              className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border transition ${
                                isPending
                                  ? 'bg-amber-50/50 border-amber-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                  {linkedDoc?.image_url ? (
                                    <img
                                      src={linkedDoc.image_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FileCheck className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-slate-800">
                                      {link.link_label || getDocLabel(linkedDoc || {})}
                                    </span>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                        isPending
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      }`}
                                    >
                                      {isPending ? 'รอตรวจสอบ' : 'ยืนยันแล้ว'}
                                    </span>
                                    {link.match_type === 'AUTO_EXACT' && (
                                      <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200 font-semibold">
                                        ⚡ ตรงอัตโนมัติ 98%
                                      </span>
                                    )}
                                    {link.match_type === 'AUTO_SUGGESTED' && (
                                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
                                        ✨ แนะนำอัตโนมัติ
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {linkedDoc?.date && `วันที่: ${formatDateThai(linkedDoc.date)}`}
                                    {linkedDoc?.vehicle_registration &&
                                      ` • ทะเบียน: ${linkedDoc.vehicle_registration}`}
                                    {linkedDoc?.scale_weight_net &&
                                      ` • น้ำหนักสุทธิ: ${linkedDoc.scale_weight_net} ตัน`}
                                    {linkedDoc &&
                                      ` • ยอดเงิน: ${formatCurrency(linkedDoc.total_amount)}`}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {linkedDoc && (
                                  <button
                                    onClick={() => onSelectDocument(linkedDoc)}
                                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
                                  >
                                    ดูบิล
                                  </button>
                                )}
                                {isPending && (
                                  <button
                                    onClick={() => onConfirmLink(link)}
                                    className="px-2.5 py-1 bg-[#27AE60] hover:bg-[#219653] text-white text-xs font-semibold rounded-lg transition"
                                  >
                                    ยืนยันจับคู่
                                  </button>
                                )}
                                <button
                                  onClick={() => onRemoveLink(link)}
                                  className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 text-xs font-semibold rounded-lg border border-slate-200 transition"
                                >
                                  ยกเลิกคู่
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        ) : (
          /* Standard Documents Table */
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-2.5 w-10 text-center"></th>
                <th className="p-3">วันที่ / ผู้ส่ง</th>
                <th className="p-3">เลขที่เอกสาร / PO</th>
                <th className="p-3">ร้านค้า / ผู้ขาย</th>
                <th className="p-3">ชื่อบริษัท (ผู้สั่งซื้อ)</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3">รายการสินค้า</th>
                <th className="p-3 text-right">ยอดรวมสุทธิ</th>
                <th className="p-3 text-center">รูปบิล</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    ไม่พบรายการเอกสารที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((item) => {
                  const isExpanded = expandedRowIds.has(item.id);
                  const itemCount = item.items.length;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`hover:bg-slate-50/80 transition ${
                          isExpanded ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        {/* Expand Toggle */}
                        <td className="p-2.5 text-center align-top">
                          <button
                            onClick={() => toggleExpandRow(item.id)}
                            className="w-6 h-6 rounded-md text-slate-400 hover:text-[#27AE60] hover:bg-emerald-50 flex items-center justify-center transition border border-slate-200"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#27AE60]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>

                        {/* Date & Sender */}
                        <td className="p-3 align-top whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {formatDateThai(item.date)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.timestamp ? item.timestamp.slice(11, 16) + ' น.' : '-'}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]"></span>
                            <span>{item.sender_name || 'ระบบ'}</span>
                          </div>
                        </td>

                        {/* Doc Number & PO */}
                        <td className="p-3 align-top">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] border ${getDocTypeBadgeClass(
                                item.doc_type
                              )}`}
                            >
                              {item.doc_type}
                            </span>
                            {item.needs_review && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5"
                                title={item.review_reason}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>รอตรวจ</span>
                              </span>
                            )}
                          </div>
                          <div className="font-mono font-semibold text-slate-900 mt-1">
                            {getDocLabel(item)}
                          </div>
                          {item.po_number && item.po_number !== '-' && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              PO: <span className="font-semibold text-blue-700">{item.po_number}</span>
                            </div>
                          )}
                          {item.scale_weight_net && (
                            <div className="text-[10px] text-amber-800 font-medium mt-0.5 flex items-center gap-1">
                              <Scale className="w-3 h-3 text-amber-600" />
                              <span>{item.scale_weight_net} ตัน</span>
                              {item.vehicle_registration && ` (${item.vehicle_registration})`}
                            </div>
                          )}
                        </td>

                        {/* Store Name */}
                        <td className="p-3 align-top font-semibold text-slate-800 max-w-[180px]">
                          {item.store_name}
                        </td>

                        {/* Buyer Company Name */}
                        <td className="p-3 align-top text-slate-600 max-w-[160px] text-[11px]">
                          <div>{item.company_name || 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'}</div>
                          {item.job_name && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              งาน: {item.job_name}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-3 align-top whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                        </td>

                        {/* Line Items Summary */}
                        <td
                          className="p-3 align-top max-w-xs text-slate-600 cursor-pointer"
                          onClick={() => toggleExpandRow(item.id)}
                        >
                          <div className="line-clamp-2 leading-relaxed">
                            {item.items_summary ||
                              item.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ') ||
                              '-'}
                          </div>
                          <span className="text-[10px] font-semibold text-[#27AE60] hover:underline mt-1 inline-block">
                            ดูรายละเอียด ({itemCount} รายการ)
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="p-3 align-top text-right font-bold font-mono text-[#27AE60] text-sm whitespace-nowrap">
                          {formatCurrency(item.total_amount)}
                        </td>

                        {/* Thumbnail */}
                        <td className="p-3 align-top text-center">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              onClick={() => onSelectDocument(item)}
                              className="w-12 h-14 rounded-lg object-cover border border-slate-200 cursor-pointer hover:ring-2 hover:ring-[#27AE60] transition mx-auto"
                            />
                          ) : (
                            <div className="w-12 h-14 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 align-top text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onSelectDocument(item)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                            >
                              ดูบิลเต็ม
                            </button>
                            <button
                              onClick={() => onEditDocument(item)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="แก้ไขเอกสาร"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDocument(item)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="ลบเอกสาร"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Line Items Sub-Table */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={10} className="p-4 pl-12 pr-6">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                                <span className="font-bold text-slate-800">
                                  รายการสินค้า / วัสดุทั้งหมด ({item.items.length} รายการ)
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  {item.store_name} • {item.doc_no || item.po_number}
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                                    <tr>
                                      <th className="p-2 w-10 text-center">#</th>
                                      <th className="p-2">รายการสินค้า / วัสดุ</th>
                                      <th className="p-2 text-center">จำนวน</th>
                                      <th className="p-2 text-center">หน่วย</th>
                                      <th className="p-2 text-right">ราคา / หน่วย</th>
                                      <th className="p-2 text-right">ราคารวม (บาท)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {item.items.map((sub, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-2 text-center text-slate-400 font-mono">
                                          {idx + 1}
                                        </td>
                                        <td className="p-2 font-medium text-slate-800">
                                          {sub.name}
                                        </td>
                                        <td className="p-2 text-center font-bold text-slate-800">
                                          {sub.quantity}
                                        </td>
                                        <td className="p-2 text-center text-slate-600">
                                          {sub.unit}
                                        </td>
                                        <td className="p-2 text-right text-slate-600 font-mono">
                                          {sub.price_per_unit > 0
                                            ? formatCurrency(sub.price_per_unit)
                                            : '-'}
                                        </td>
                                        <td className="p-2 text-right font-bold text-[#27AE60] font-mono">
                                          {sub.total > 0 ? formatCurrency(sub.total) : '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                                    <tr>
                                      <td colSpan={5} className="p-2 text-right text-slate-700">
                                        ยอดรวมสุทธิ:
                                      </td>
                                      <td className="p-2 text-right text-[#27AE60] font-mono">
                                        {formatCurrency(item.total_amount)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
