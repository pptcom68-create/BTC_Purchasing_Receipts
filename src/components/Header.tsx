import React from 'react';
import { RotateCw, PlusCircle, Building2, ShieldCheck } from 'lucide-react';
import { BTC_COMPANY_INFO } from '../data/constants';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenCreate: () => void;
  onOpenCompany: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  onOpenCreate,
  onOpenCompany,
  onOpenSettings,
}) => {
  return (
    <header className="bg-white text-slate-800 sticky top-0 z-30 shadow-sm border-t-4 border-[#27AE60] border-b border-slate-200 shrink-0">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onOpenCompany}>
            <div className="bg-white p-1 rounded-xl w-11 h-11 shadow-sm flex items-center justify-center overflow-hidden border border-slate-200">
              <img
                src={BTC_COMPANY_INFO.logoUrl}
                alt="โลโก้ บุรีรัมย์ธงชัยก่อสร้าง"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML =
                      '<div class="bg-[#27AE60] w-full h-full text-white font-bold text-xs flex items-center justify-center rounded-lg">BTC</div>';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg leading-tight text-slate-900">
                  ระบบตรวจสอบและติดตามเอกสารจัดซื้อ
                </h1>
                <span className="bg-emerald-50 text-[#27AE60] text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200 hidden sm:inline-block">
                  v3.12.0
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span>{BTC_COMPANY_INFO.nameTh}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-medium">ฝ่ายจัดซื้อและควบคุมสต็อก</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-200 transition shadow-sm disabled:opacity-50"
              title="รีเฟรชและตรวจสอบความสอดคล้องของเอกสาร"
            >
              <RotateCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin text-[#27AE60]' : ''}`} />
              <span className="hidden sm:inline">รีเฟรชข้อมูล</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 bg-[#27AE60] hover:bg-[#219653] text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shadow-sm"
              title="สร้างคำสั่งซื้อใหม่ หรืออัปโหลดบิล/ใบเสร็จเพื่อสแกนด้วย AI"
            >
              <PlusCircle className="w-4 h-4" />
              <span>สร้างเอกสาร / สแกนบิล</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
