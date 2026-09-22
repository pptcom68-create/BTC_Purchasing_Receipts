import React from 'react';
import { X, Building2, MapPin, Phone, Mail, FileBadge } from 'lucide-react';
import { BTC_COMPANY_INFO } from '../data/constants';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-white border-b border-slate-200 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white p-0.5 rounded-lg flex items-center justify-center border border-slate-200">
              <img
                src={BTC_COMPANY_INFO.logoUrl}
                alt="BTC Logo"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              ข้อมูลองค์กร / เจ้าของระบบจัดซื้อ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="text-center pb-4 border-b border-slate-100">
            <img
              src={BTC_COMPANY_INFO.logoUrl}
              alt="บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด"
              className="h-16 mx-auto mb-2 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h4 className="text-base font-bold text-slate-900">{BTC_COMPANY_INFO.nameTh}</h4>
            <p className="text-slate-500 font-medium">{BTC_COMPANY_INFO.nameEn}</p>
          </div>

          <div className="space-y-2.5 text-slate-700">
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="w-8 h-8 bg-emerald-100 text-[#27AE60] rounded-lg flex items-center justify-center text-sm shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">
                  ที่อยู่สำนักงานใหญ่
                </span>
                <span className="font-medium text-slate-800 leading-relaxed">
                  {BTC_COMPANY_INFO.address}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm shrink-0">
                <FileBadge className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">
                  เลขประจำตัวผู้เสียภาษีอากร
                </span>
                <span className="font-bold font-mono text-slate-900 text-sm">
                  {BTC_COMPANY_INFO.taxId}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    เบอร์โทรศัพท์
                  </span>
                  <a
                    href={`tel:${BTC_COMPANY_INFO.tel}`}
                    className="font-bold text-slate-800 hover:text-[#27AE60]"
                  >
                    {BTC_COMPANY_INFO.tel}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    อีเมลติดต่อ
                  </span>
                  <a
                    href={`mailto:${BTC_COMPANY_INFO.email}`}
                    className="font-bold text-slate-800 hover:text-[#27AE60] truncate block max-w-[130px]"
                  >
                    {BTC_COMPANY_INFO.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition"
          >
            ตกลง / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
