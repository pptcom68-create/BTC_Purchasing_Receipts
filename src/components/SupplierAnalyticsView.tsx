import React, { useState } from 'react';
import { Store, TrendingUp, DollarSign, FileText, ArrowUpDown } from 'lucide-react';
import { PurchasingDocument } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SupplierAnalyticsViewProps {
  documents: PurchasingDocument[];
}

export const SupplierAnalyticsView: React.FC<SupplierAnalyticsViewProps> = ({ documents }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group by store name
  const supplierMap: Record<
    string,
    {
      name: string;
      total: number;
      count: number;
      itemCount: number;
      categories: Set<string>;
      latestDate: string;
    }
  > = {};

  documents.forEach((d) => {
    const name = (d.store_name || '').trim();
    if (!name || name === 'ไม่ระบุร้านค้า') return;

    if (!supplierMap[name]) {
      supplierMap[name] = {
        name,
        total: 0,
        count: 0,
        itemCount: 0,
        categories: new Set(),
        latestDate: d.date || '',
      };
    }

    supplierMap[name].total += d.total_amount || 0;
    supplierMap[name].count += 1;
    supplierMap[name].itemCount += d.items ? d.items.length : 0;
    if (d.category) supplierMap[name].categories.add(d.category);
    if (d.date && d.date > supplierMap[name].latestDate) {
      supplierMap[name].latestDate = d.date;
    }
  });

  const suppliers = Object.values(supplierMap).sort((a, b) => b.total - a.total);
  const grandTotal = suppliers.reduce((sum, s) => sum + s.total, 0);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Store className="w-5 h-5 text-[#27AE60]" />
            <span>วิเคราะห์ร้านค้า / ซัพพลายเออร์ (Supplier Analytics)</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
              {suppliers.length} ร้านค้า
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ประเมินยอดจัดซื้อรวม ยอดเฉลี่ยต่อบิล และสัดส่วนการสั่งซื้อของคู่ค้าแต่ละราย
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อร้านค้า..."
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3">ร้านค้า / ซัพพลายเออร์</th>
              <th className="p-3">หมวดหมู่สินค้า</th>
              <th className="p-3 text-center">จำนวนบิล</th>
              <th className="p-3 text-center">จำนวนรายการ</th>
              <th className="p-3 text-right">ยอดจัดซื้อรวม</th>
              <th className="p-3 text-right">เฉลี่ยต่อบิล</th>
              <th className="p-3 w-48">% ส่วนแบ่งยอดซื้อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  ไม่พบข้อมูลร้านค้าตามคำค้นหา
                </td>
              </tr>
            ) : (
              filtered.map((s, idx) => {
                const pct = grandTotal > 0 ? (s.total / grandTotal) * 100 : 0;
                const avg = s.count > 0 ? s.total / s.count : 0;
                return (
                  <tr key={s.name} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-xs">{s.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ซื้อล่าสุด: {s.latestDate || '-'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {Array.from(s.categories).map((cat) => (
                          <span
                            key={cat}
                            className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-800 font-mono">
                      {s.count} ใบ
                    </td>
                    <td className="p-3 text-center text-slate-600 font-mono">
                      {s.itemCount} รายการ
                    </td>
                    <td className="p-3 text-right font-bold text-[#27AE60] font-mono text-xs">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="p-3 text-right text-slate-600 font-mono">
                      {formatCurrency(avg)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="bg-[#27AE60] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-600 w-12 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
