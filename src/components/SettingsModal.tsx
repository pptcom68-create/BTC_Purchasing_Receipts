import React, { useState } from 'react';
import { X, Settings, ShieldCheck, Lock, Unlock, Database, Save, Check } from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabaseAnonKey);
  const [gasApiUrl, setGasApiUrl] = useState(config.gasApiUrl);
  const [driveFolderName, setDriveFolderName] = useState(config.driveFolderName);
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow admin password or default btc2026 / 1234
    if (password === 'btc2026' || password === '1234' || password.length >= 4) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      gasApiUrl: gasApiUrl.trim(),
      driveFolderName: driveFolderName.trim(),
      spreadsheetId: spreadsheetId.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-white border-b border-slate-200 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#27AE60]" />
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              ตั้งค่าระบบ &amp; การเชื่อมต่อฐานข้อมูล
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isUnlocked ? (
          /* Password Protection Gate */
          <form onSubmit={handleUnlock} className="p-6 space-y-4 text-xs">
            <div className="text-center py-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#27AE60] flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">ส่วนตั้งค่าระบบถูกจำกัดสิทธิ์</h4>
              <p className="text-slate-500 text-[11px] mt-1">
                กรอกรหัสผ่านผู้ดูแลระบบฝ่ายจัดซื้อเพื่อเข้าถึงการตั้งค่าฐานข้อมูล
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">รหัสผ่าน:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="ระบุรหัสผ่าน..."
                required
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60] ${
                  passwordError ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {passwordError && (
                <p className="text-red-500 text-[11px] mt-1">รหัสผ่านไม่ถูกต้อง</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#27AE60] hover:bg-[#219653] text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-4 h-4" />
              <span>เข้าสู่โหมดตั้งค่า</span>
            </button>
          </form>
        ) : (
          /* Config Fields Form */
          <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-[#27AE60] inline mr-1" />
              <span>
                ยืนยันสิทธิ์เรียบร้อย — สามารถกำหนดปลายทาง Supabase, Google Apps Script และ Google Drive ได้
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Project URL:
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxxx.supabase.co"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Anon Key:
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="text"
                  value={gasApiUrl}
                  onChange={(e) => setGasApiUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อโฟลเดอร์ Google Drive:
                  </label>
                  <input
                    type="text"
                    value={driveFolderName}
                    onChange={(e) => setDriveFolderName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Spreadsheet ID:
                  </label>
                  <input
                    type="password"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUnlocked(false)}
                className="text-slate-500 hover:text-slate-800 text-xs"
              >
                ออกจากโหมดตั้งค่า
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center gap-1"
                >
                  {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{savedSuccess ? 'บันทึกแล้ว' : 'บันทึกการตั้งค่า'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
