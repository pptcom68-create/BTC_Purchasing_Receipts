import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Store,
  Tags,
  FileText,
  Bot,
  Building2,
  Settings,
  Link2,
} from 'lucide-react';

export type ActivePage =
  | 'overview'
  | 'documents'
  | 'suppliers'
  | 'prices'
  | 'billing'
  | 'ai-prompts';

interface SidebarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  onOpenCompany: () => void;
  onOpenSettings: () => void;
  pendingReviewCount: number;
  unmatchedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  onOpenCompany,
  onOpenSettings,
  pendingReviewCount,
  unmatchedCount,
}) => {
  const menuItems: {
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'ภาพรวม (Dashboard)',
      icon: LayoutDashboard,
    },
    {
      id: 'documents',
      label: 'ตารางบิล & คำสั่งซื้อ',
      icon: FileSpreadsheet,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'suppliers',
      label: 'วิเคราะห์ร้านค้า',
      icon: Store,
    },
    {
      id: 'prices',
      label: 'ติดตามราคาวัสดุ',
      icon: Tags,
    },
    {
      id: 'billing',
      label: 'วางบิล / ใบกำกับภาษี',
      icon: FileText,
      badge: unmatchedCount > 0 ? unmatchedCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'ai-prompts',
      label: 'เอกสารสำหรับ AI',
      icon: Bot,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-slate-50 text-slate-700 border-r border-slate-200 min-h-0">
        <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 flex items-center justify-between">
          <span>เมนูระบบจัดซื้อ</span>
          <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-mono">
            BTC-ERP
          </span>
        </div>

        <nav className="flex-1 py-2.5 space-y-1 overflow-y-auto custom-scrollbar px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-[#27AE60] font-semibold shadow-xs border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#27AE60]' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom system options */}
        <div className="p-2 border-t border-slate-200 space-y-1">
          <button
            type="button"
            onClick={onOpenCompany}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <span>ข้อมูลองค์กร (BTC)</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Settings className="w-4 h-4 text-slate-500 shrink-0" />
            <span>ตั้งค่าระบบ & API</span>
          </button>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-white/50 text-[10px] text-slate-500 leading-relaxed">
          <div className="font-semibold text-slate-700 mb-0.5">บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด</div>
          <div>เชื่อมโยงข้อมูล PO, ใบส่งของ, ใบชั่ง และใบกำกับภาษี</div>
        </div>
      </aside>

      {/* Mobile Horizontal Menu Bar */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-2 bg-slate-50 border-b border-slate-200 shrink-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                isActive
                  ? 'bg-[#27AE60] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-[#27AE60]' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenCompany}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 whitespace-nowrap shrink-0"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>BTC</span>
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 whitespace-nowrap shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>ตั้งค่า</span>
        </button>
      </div>
    </>
  );
};
