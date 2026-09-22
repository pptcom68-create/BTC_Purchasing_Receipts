import React from 'react';
import {
  Wallet,
  FileText,
  Layers,
  Store,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PurchasingDocument, DocumentLink } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OverviewDashboardProps {
  documents: PurchasingDocument[];
  links: DocumentLink[];
  onNavigateToTab: (tab: 'all' | 'po' | 'matched') => void;
  onSelectDocument: (doc: PurchasingDocument) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  documents,
  links,
  onNavigateToTab,
  onSelectDocument,
}) => {
  const totalAmount = documents.reduce((sum, d) => sum + (d.total_amount || 0), 0);
  const totalCount = documents.length;
  const totalItemsCount = documents.reduce(
    (sum, d) => sum + (d.items ? d.items.length : 0),
    0
  );

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  const supplierSet = new Set<string>();
  const senderMap: Record<string, number> = {};

  documents.forEach((d) => {
    if (d.category) {
      categoryMap[d.category] = (categoryMap[d.category] || 0) + (d.total_amount || 0);
    }
    if (d.store_name && d.store_name !== 'ไม่ระบุร้านค้า') {
      supplierSet.add(d.store_name);
    }
    if (d.sender_name && d.sender_name !== '-' && d.sender_name !== 'ไม่ทราบชื่อ') {
      senderMap[d.sender_name] = (senderMap[d.sender_name] || 0) + 1;
    }
  });

  let topCategory = '-';
  let maxCatAmount = 0;
  Object.entries(categoryMap).forEach(([cat, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCategory = cat;
    }
  });

  // Most active sender
  let topSender = '-';
  let topSenderCount = 0;
  Object.entries(senderMap).forEach(([sender, count]) => {
    if (count > topSenderCount) {
      topSenderCount = count;
      topSender = sender;
    }
  });

  const pendingReviewDocs = documents.filter((d) => d.needs_review);
  const poDocs = documents.filter((d) => d.doc_type === 'ใบสั่งซื้อ');
  const pendingLinks = links.filter((l) => l.status === 'pending');
  const confirmedLinks = links.filter((l) => l.status === 'confirmed');

  // Group by month for simple trend bar chart
  const monthMap: Record<string, number> = {};
  documents.forEach((d) => {
    if (d.date && d.date.length >= 7) {
      const ym = d.date.slice(0, 7);
      monthMap[ym] = (monthMap[ym] || 0) + (d.total_amount || 0);
    }
  });
  const monthEntries = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
  const maxMonthAmount = Math.max(...Object.values(monthMap), 1);

  return (
    <div className="space-y-4">
      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Spending */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 border-l-4 border-l-[#27AE60] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">ยอดจัดซื้อรวมทั้งหมด</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {formatCurrency(totalAmount)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#27AE60]" />
              <span>คำนวณตามรายการสินค้าจริง</span>
            </p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-[#27AE60] rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Total Documents Count */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 border-l-4 border-l-[#27AE60] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">จำนวนบิล / เอกสาร</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {totalCount} ใบ
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              รวม {totalItemsCount} รายการสินค้า
            </p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-[#27AE60] rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Top Category */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 border-l-4 border-l-[#27AE60] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">หมวดหมู่หลัก</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1 truncate max-w-[140px]">
              {topCategory}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              ยอดจัดซื้อสูงสุด {formatCurrency(maxCatAmount)}
            </p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-[#27AE60] rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Suppliers Count */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 border-l-4 border-l-[#27AE60] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">ร้านค้า / ซัพพลายเออร์</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {supplierSet.size} ร้าน
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">คู่ค้าฝ่ายจัดซื้อ BTC</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-[#27AE60] rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <Store className="w-5 h-5" />
          </div>
        </div>

        {/* Senders Count */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 border-l-4 border-l-[#27AE60] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">ผู้ส่งบิล (LINE / ผู้ใช้งาน)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {Object.keys(senderMap).length} คน
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[150px]">
              {topSender !== '-' ? `${topSender} (${topSenderCount} ใบ)` : 'บันทึกผ่านระบบ'}
            </p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-[#27AE60] rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Actionable Status Notice Bar */}
      {(pendingReviewDocs.length > 0 || pendingLinks.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">เอกสารรอการตรวจสอบความถูกต้อง:</span>
              <span className="ml-1">
                มีบิลรอตรวจ <strong className="text-amber-800">{pendingReviewDocs.length} ใบ</strong> และมีคู่บิลที่แนะนำจับคู่อัตโนมัติรอการยืนยัน <strong className="text-amber-800">{pendingLinks.length} คู่</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pendingReviewDocs.length > 0 && (
              <button
                onClick={() => onNavigateToTab('all')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
              >
                ตรวจบิลค้าง ({pendingReviewDocs.length})
              </button>
            )}
            {pendingLinks.length > 0 && (
              <button
                onClick={() => onNavigateToTab('matched')}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition"
              >
                ตรวจคู่แนะนำ ({pendingLinks.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Visual Charts: Monthly Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#27AE60]" />
              <span>แนวโน้มยอดจัดซื้อรายเดือน</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              อัปเดตตามคำสั่งซื้อและเอกสารล่าสุด
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-56 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100">
            {monthEntries.length > 0 ? (
              monthEntries.map(([month, amt]) => {
                const heightPercent = Math.max(12, Math.round((amt / maxMonthAmount) * 100));
                return (
                  <div
                    key={month}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                  >
                    <div className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {formatCurrency(amt)}
                    </div>
                    <div
                      className="w-full max-w-[48px] bg-gradient-to-t from-[#27AE60] to-[#2ecc71] rounded-t-lg transition-all duration-300 group-hover:brightness-95"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <div className="text-[11px] font-medium text-slate-600 mt-1">
                      {month}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-xs text-slate-400 py-12">
                ยังไม่มีข้อมูลรายเดือน
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <span>
              จำนวนคำสั่งซื้อ PO ในระบบ: <strong className="text-slate-800">{poDocs.length} ฉบับ</strong>
            </span>
            <span>
              คู่บิลที่จับคู่สำเร็จ: <strong className="text-[#27AE60]">{confirmedLinks.length} คู่</strong>
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-[#27AE60]" />
              <span>สัดส่วนค่าใช้จ่ายตามหมวดหมู่</span>
            </h3>
            <div className="space-y-2.5">
              {Object.entries(categoryMap)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amt]) => {
                  const pct = totalAmount > 0 ? Math.round((amt / totalAmount) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{cat}</span>
                        <span className="text-slate-500 font-mono">
                          {formatCurrency(amt)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#27AE60] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">ควบคุมงบประมาณโครงการ</span>
            <button
              onClick={() => onNavigateToTab('all')}
              className="text-[#27AE60] hover:underline font-semibold flex items-center gap-1"
            >
              <span>ดูเอกสารทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Purchasing Documents Quick List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#27AE60]" />
            <span>เอกสารจัดซื้อล่าสุด (Recent Documents)</span>
          </h3>
          <button
            onClick={() => onNavigateToTab('all')}
            className="text-xs text-[#27AE60] hover:underline font-semibold flex items-center gap-1"
          >
            <span>ดูทั้งหมด ({documents.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {documents.slice(0, 5).map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                  {doc.image_url ? (
                    <img
                      src={doc.image_url}
                      alt={doc.store_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 truncate">
                      {doc.store_name}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {doc.doc_type} {doc.doc_no || ''}
                    </span>
                    {doc.po_number && doc.po_number !== '-' && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">
                        PO: {doc.po_number}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {doc.items_summary || doc.job_name || '-'}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-[#27AE60] text-sm font-mono">
                  {formatCurrency(doc.total_amount)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {doc.date || doc.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
