import React, { useState } from 'react';
import { Tags, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle, Clock, Search } from 'lucide-react';
import { PurchasingDocument } from '../types';
import { formatCurrency, formatDateThai } from '../utils/formatters';

interface MaterialPriceTrackerViewProps {
  documents: PurchasingDocument[];
}

interface PriceRecord {
  date: string;
  po: string;
  store: string;
  qty: number;
  price: number;
  total: number;
  unit: string;
}

interface MaterialStats {
  name: string;
  unit: string;
  records: PriceRecord[];
  avg: number;
  min: number;
  max: number;
  latest: PriceRecord | null;
  latestPrice: number;
  overpriced: boolean; // >15% above average
  underpriced: boolean; // <15% below average
  count: number;
  totalQty: number;
}

export const MaterialPriceTrackerView: React.FC<MaterialPriceTrackerViewProps> = ({ documents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  // Collect materials
  const materialMap: Record<string, { name: string; unit: string; records: PriceRecord[] }> = {};

  documents.forEach((d) => {
    if (!d.items || d.items.length === 0) return;
    d.items.forEach((sub) => {
      const name = (sub.name || '').trim();
      if (!name) return;
      if (!materialMap[name]) {
        materialMap[name] = {
          name,
          unit: sub.unit || 'หน่วย',
          records: [],
        };
      }
      materialMap[name].records.push({
        date: d.date || '',
        po: d.po_number || '-',
        store: d.store_name || '-',
        qty: sub.quantity || 0,
        price: sub.price_per_unit || 0,
        total: sub.total || 0,
        unit: sub.unit || 'หน่วย',
      });
    });
  });

  const stats: MaterialStats[] = Object.values(materialMap).map((m) => {
    const validPrices = m.records.map((r) => r.price).filter((p) => p > 0);
    const avg = validPrices.length ? validPrices.reduce((s, p) => s + p, 0) / validPrices.length : 0;
    const min = validPrices.length ? Math.min(...validPrices) : 0;
    const max = validPrices.length ? Math.max(...validPrices) : 0;

    // Sort records descending by date
    const sortedRecords = [...m.records].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sortedRecords[0] || null;
    const latestPrice = latest ? latest.price : 0;

    const overpriced = latestPrice > 0 && avg > 0 && latestPrice > avg * 1.15;
    const underpriced = latestPrice > 0 && avg > 0 && latestPrice < avg * 0.85;

    return {
      name: m.name,
      unit: m.unit,
      records: sortedRecords,
      avg,
      min,
      max,
      latest,
      latestPrice,
      overpriced,
      underpriced,
      count: validPrices.length,
      totalQty: m.records.reduce((s, r) => s + (r.qty || 0), 0),
    };
  });

  // Sort: overpriced first, then by frequency
  stats.sort((a, b) => {
    if (a.overpriced && !b.overpriced) return -1;
    if (!a.overpriced && b.overpriced) return 1;
    return b.count - a.count;
  });

  const filtered = stats.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    if (showOnlyAlerts) {
      return matchesSearch && (s.overpriced || s.underpriced);
    }
    return matchesSearch;
  });

  const overpricedCount = stats.filter((s) => s.overpriced).length;

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Tags className="w-5 h-5 text-amber-600" />
            <span>ระบบติดตามราคาวัสดุก่อสร้าง (Material Price Tracker)</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
              {stats.length} รายการวัสดุ
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            เปรียบเทียบราคาล่าสุดกับราคาเฉลี่ย เตือนเมื่อพบราคาซื้อแพงกว่าปกติเกิน 15%
          </p>
        </div>

        {/* Search & Alerts Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-48 sm:w-60">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อวัสดุ..."
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer shadow-xs select-none">
            <input
              type="checkbox"
              checked={showOnlyAlerts}
              onChange={(e) => setShowOnlyAlerts(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-amber-900">
              เฉพาะรายการราคาผิดปกติ ({overpricedCount})
            </span>
          </label>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3">วัสดุ / สินค้าก่อสร้าง</th>
              <th className="p-3 text-center">หน่วย</th>
              <th className="p-3 text-right">ราคาซื้อล่าสุด</th>
              <th className="p-3 text-right">ราคาเฉลี่ย</th>
              <th className="p-3 text-right">ต่ำสุด</th>
              <th className="p-3 text-right">สูงสุด</th>
              <th className="p-3 text-center">จำนวนครั้ง</th>
              <th className="p-3 text-center">สถานะราคา</th>
              <th className="p-3 text-center">ประวัติราคา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  {showOnlyAlerts
                    ? 'ไม่พบรายการที่ราคาผิดปกติ'
                    : 'ไม่พบรายการวัสดุก่อสร้างตามคำค้นหา'}
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const isExpanded = expandedMaterial === s.name;
                const diffPct =
                  s.avg > 0 && s.latestPrice > 0
                    ? (((s.latestPrice - s.avg) / s.avg) * 100).toFixed(1)
                    : null;

                return (
                  <React.Fragment key={s.name}>
                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900 max-w-[220px]">
                        {s.name}
                      </td>
                      <td className="p-3 text-center text-slate-500">{s.unit}</td>
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          s.overpriced ? 'text-red-600' : 'text-slate-800'
                        }`}
                      >
                        {s.latestPrice > 0 ? formatCurrency(s.latestPrice) : '-'}
                        {diffPct && (
                          <span
                            className={`ml-1 text-[10px] font-normal ${
                              s.overpriced ? 'text-red-500 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            ({Number(diffPct) > 0 ? `+${diffPct}` : diffPct}%)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {formatCurrency(s.avg)}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-600">
                        {formatCurrency(s.min)}
                      </td>
                      <td className="p-3 text-right font-mono text-red-500">
                        {formatCurrency(s.max)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">
                        {s.count} ครั้ง
                      </td>
                      <td className="p-3 text-center">
                        {s.overpriced ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>แพงเกินจริง (&gt;15%)</span>
                          </span>
                        ) : s.underpriced ? (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-300 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            <ArrowDownRight className="w-3 h-3" />
                            <span>ต่ำกว่าเฉลี่ย</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            <CheckCircle className="w-3 h-3" />
                            <span>ราคาปกติ</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() =>
                            setExpandedMaterial(isExpanded ? null : s.name)
                          }
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                        >
                          {isExpanded ? 'ปิดประวัติ' : 'ดูประวัติ'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable History Table */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={9} className="p-3 pl-8 pr-8 border-b border-slate-200">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>ประวัติการซื้อ {s.name} ย้อนหลัง</span>
                              </span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                รวม {s.records.length} ครั้ง
                              </span>
                            </div>

                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[10px]">
                                <tr>
                                  <th className="p-1.5">วันที่</th>
                                  <th className="p-1.5">เลขที่ PO</th>
                                  <th className="p-1.5">ร้านค้า / ผู้ขาย</th>
                                  <th className="p-1.5 text-center">จำนวน</th>
                                  <th className="p-1.5 text-right">ราคา/หน่วย</th>
                                  <th className="p-1.5 text-right">ราคารวม</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px]">
                                {s.records.map((rec, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50">
                                    <td className="p-1.5 text-slate-600">
                                      {formatDateThai(rec.date)}
                                    </td>
                                    <td className="p-1.5 font-mono text-blue-700 font-medium">
                                      {rec.po}
                                    </td>
                                    <td className="p-1.5 text-slate-700 font-medium">
                                      {rec.store}
                                    </td>
                                    <td className="p-1.5 text-center font-mono">
                                      {rec.qty} {rec.unit}
                                    </td>
                                    <td className="p-1.5 text-right font-mono font-semibold text-slate-800">
                                      {formatCurrency(rec.price)}
                                    </td>
                                    <td className="p-1.5 text-right font-mono font-bold text-[#27AE60]">
                                      {formatCurrency(rec.total)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
      </div>
    </div>
  );
};
