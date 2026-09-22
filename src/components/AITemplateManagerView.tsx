import React, { useState, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  Layers,
  CheckCircle2,
  RefreshCw,
  Plus,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Scale,
  Building2,
  Receipt,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  Search,
  ChevronRight,
  Sliders,
  FileCode,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { AIPromptSet, AISample } from '../types';
import {
  ACCOUNTING_DOC_TYPES,
  STATUTORY_FIELD_DEFINITIONS,
  BTC_COMPANY_INFO,
} from '../data/constants';

interface AITemplateManagerViewProps {
  prompts: AIPromptSet[];
  samples: AISample[];
  onGeneratePrompt: (docType: string) => void;
  onUpdateFieldConfig: (docType: string, field: string, enabled: boolean) => void;
  onSaveSampleReview: (sampleId: string, docType: string, groundTruth: any) => void;
  onCreatePromptSet: (title: string, docType: string) => void;
}

export const AITemplateManagerView: React.FC<AITemplateManagerViewProps> = ({
  prompts,
  samples,
  onGeneratePrompt,
  onUpdateFieldConfig,
  onSaveSampleReview,
  onCreatePromptSet,
}) => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'samples'>('prompts');
  const [selectedGroup, setSelectedGroup] = useState<string>('ทั้งหมด');
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [newTitle, setNewTitle] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [selectedPromptDocType, setSelectedPromptDocType] = useState<string>('ใบกำกับภาษีแบบเต็มรูป');
  const [promptSearchQuery, setPromptSearchQuery] = useState<string>('');

  const currentSample = samples[selectedSampleIndex] || null;

  // Ground truth edit fields
  const [sampleDocType, setSampleDocType] = useState(
    currentSample?.doc_type || currentSample?.predicted_doc_type || ''
  );
  const [sampleDate, setSampleDate] = useState(currentSample?.date || '');
  const [sampleDocNo, setSampleDocNo] = useState(currentSample?.doc_no || '');
  const [sampleTaxInvoiceNo, setSampleTaxInvoiceNo] = useState(
    currentSample?.ground_truth.tax_invoice_no || ''
  );
  const [sampleStore, setSampleStore] = useState(currentSample?.store_name || '');
  const [sampleVendorTaxId, setSampleVendorTaxId] = useState(
    currentSample?.ground_truth.vendor_tax_id || ''
  );
  const [sampleVendorBranch, setSampleVendorBranch] = useState(
    currentSample?.ground_truth.vendor_branch || 'สำนักงานใหญ่ (00000)'
  );
  const [sampleSubtotal, setSampleSubtotal] = useState(
    currentSample?.ground_truth.subtotal_amount ? String(currentSample.ground_truth.subtotal_amount) : ''
  );
  const [sampleVatAmount, setSampleVatAmount] = useState(
    currentSample?.ground_truth.vat_amount ? String(currentSample.ground_truth.vat_amount) : ''
  );
  const [sampleTotal, setSampleTotal] = useState(
    currentSample?.total_amount ? String(currentSample.total_amount) : ''
  );
  const [sampleWeightNet, setSampleWeightNet] = useState(
    currentSample?.ground_truth.scale_weight_net ? String(currentSample.ground_truth.scale_weight_net) : ''
  );
  const [sampleVehicle, setSampleVehicle] = useState(
    currentSample?.ground_truth.vehicle_registration || ''
  );

  React.useEffect(() => {
    if (currentSample) {
      setSampleDocType(currentSample.doc_type || currentSample.predicted_doc_type || '');
      setSampleDate(currentSample.date || currentSample.ground_truth.date || '');
      setSampleDocNo(currentSample.doc_no || currentSample.ground_truth.doc_no || '');
      setSampleTaxInvoiceNo(currentSample.ground_truth.tax_invoice_no || '');
      setSampleStore(currentSample.store_name || currentSample.ground_truth.store_name || '');
      setSampleVendorTaxId(currentSample.ground_truth.vendor_tax_id || '');
      setSampleVendorBranch(currentSample.ground_truth.vendor_branch || 'สำนักงานใหญ่ (00000)');
      setSampleSubtotal(
        currentSample.ground_truth.subtotal_amount
          ? String(currentSample.ground_truth.subtotal_amount)
          : ''
      );
      setSampleVatAmount(
        currentSample.ground_truth.vat_amount
          ? String(currentSample.ground_truth.vat_amount)
          : ''
      );
      setSampleTotal(
        currentSample.total_amount || currentSample.ground_truth.total_amount
          ? String(currentSample.total_amount || currentSample.ground_truth.total_amount)
          : ''
      );
      setSampleWeightNet(
        currentSample.ground_truth.scale_weight_net
          ? String(currentSample.ground_truth.scale_weight_net)
          : ''
      );
      setSampleVehicle(currentSample.ground_truth.vehicle_registration || '');
    }
  }, [selectedSampleIndex, currentSample]);

  // Tax calculation helper
  const handleAutoCalcTax = () => {
    const sub = parseFloat(sampleSubtotal);
    if (!isNaN(sub) && sub > 0) {
      const vat = Math.round(sub * 0.07 * 100) / 100;
      setSampleVatAmount(String(vat));
      setSampleTotal(String(Math.round((sub + vat) * 100) / 100));
    } else {
      const tot = parseFloat(sampleTotal);
      if (!isNaN(tot) && tot > 0) {
        const subCalc = Math.round((tot / 1.07) * 100) / 100;
        const vatCalc = Math.round((tot - subCalc) * 100) / 100;
        setSampleSubtotal(String(subCalc));
        setSampleVatAmount(String(vatCalc));
      }
    }
  };

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDocType.trim()) return;
    onCreatePromptSet(newTitle.trim(), newDocType.trim());
    setNewTitle('');
    setNewDocType('');
    setShowCreatePrompt(false);
  };

  const handleSaveReview = () => {
    if (!currentSample) return;
    const subtotal = parseFloat(sampleSubtotal) || undefined;
    const vat = parseFloat(sampleVatAmount) || undefined;
    const total = parseFloat(sampleTotal) || 0;
    const weight = parseFloat(sampleWeightNet) || null;

    onSaveSampleReview(currentSample.id, sampleDocType, {
      ...currentSample.ground_truth,
      doc_type: sampleDocType,
      date: sampleDate,
      doc_no: sampleDocNo,
      tax_invoice_no: sampleTaxInvoiceNo,
      store_name: sampleStore,
      vendor_tax_id: sampleVendorTaxId,
      vendor_branch: sampleVendorBranch,
      subtotal_amount: subtotal,
      vat_amount: vat,
      total_amount: total,
      scale_weight_net: weight,
      vehicle_registration: sampleVehicle,
      is_valid_tax_invoice:
        sampleVendorTaxId.length === 13 &&
        sampleTaxInvoiceNo.length > 0 &&
        total > 0 &&
        (vat !== undefined ? vat > 0 : true),
    });
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Reset fields to statutory defaults
  const handleResetToStatutory = (docTypeName: string) => {
    const docInfo = ACCOUNTING_DOC_TYPES.find((d) => d.name === docTypeName);
    if (!docInfo) return;

    STATUTORY_FIELD_DEFINITIONS.forEach((f) => {
      const isMandatory = docInfo.mandatoryFields.includes(f.key);
      const isRecommended = docInfo.recommendedFields.includes(f.key);
      onUpdateFieldConfig(docTypeName, f.key, isMandatory || isRecommended);
    });
  };

  // Filter prompts by group and search query
  const filteredPrompts = useMemo(() => {
    const seenKeys = new Set<string>();
    return prompts.filter((p) => {
      // Deduplicate prompts by doc_type and id
      const dedupeKey = p.doc_type || p.id;
      if (seenKeys.has(dedupeKey)) return false;
      seenKeys.add(dedupeKey);

      const docTypeObj = ACCOUNTING_DOC_TYPES.find((d) => d.name === p.doc_type);
      const matchesGroup =
        selectedGroup === 'ทั้งหมด' || docTypeObj?.group === selectedGroup;

      const q = promptSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.doc_type.toLowerCase().includes(q) ||
        (docTypeObj?.code && docTypeObj.code.toLowerCase().includes(q)) ||
        (docTypeObj?.legalSection && docTypeObj.legalSection.toLowerCase().includes(q)) ||
        (docTypeObj?.description && docTypeObj.description.toLowerCase().includes(q));

      return matchesGroup && matchesSearch;
    });
  }, [prompts, selectedGroup, promptSearchQuery]);

  // Selected prompt for the right detail panel
  const activePrompt = useMemo(() => {
    return (
      filteredPrompts.find((p) => p.doc_type === selectedPromptDocType) ||
      filteredPrompts[0] ||
      prompts[0]
    );
  }, [filteredPrompts, selectedPromptDocType, prompts]);

  const activePromptDocObj = useMemo(() => {
    if (!activePrompt) return undefined;
    return ACCOUNTING_DOC_TYPES.find((d) => d.name === activePrompt.doc_type);
  }, [activePrompt]);

  // Current doc type metadata for review
  const activeDocInfo = ACCOUNTING_DOC_TYPES.find((d) => d.name === sampleDocType);

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Thai Accounting Standard context */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#27AE60] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <span>ระบบชุดคำสั่ง AI และกระดานตรวจทานมาตรฐานภาษีอากร</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ป.รัษฎากร ม.86/4 &amp; มาตรฐานบัญชีไทย
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                ควบคุมฟิลด์ที่ AI ต้องดึงตามประเภทเอกสาร บันทึกตัวอย่างจริง (Ground Truth) และตรวจสอบความสมบูรณ์ทางภาษี
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'prompts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#27AE60]" />
            <span>ชุดคำสั่งตามประเภทเอกสาร ({prompts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>กระดานตรวจทาน &amp; ฝึกฝน AI ({samples.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar p-5">
        {activeTab === 'prompts' ? (
          /* =========================================================
             TAB 1: MASTER-DETAIL VIEW: DOCUMENT TYPES & MANAGEMENT
             ========================================================= */
          <div className="space-y-4">
            {/* Statutory Standard Clarification Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27AE60] animate-pulse" />
                <span className="font-semibold text-emerald-950">
                  ระบบรองรับเอกสารทางบัญชีและภาษีอากรทั้งหมด <strong>{ACCOUNTING_DOC_TYPES.length} ประเภท</strong> (จัดกลุ่มเป็น 4 หมวดหมู่หลักตามประมวลรัษฎากรและมาตรฐานการบัญชีไทย TAS)
                </span>
              </div>
              <button
                onClick={() => setShowCreatePrompt(!showCreatePrompt)}
                className="px-3 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มประเภทเอกสารองค์กร</span>
              </button>
            </div>

            {/* Create Prompt Form (Collapsible) */}
            {showCreatePrompt && (
              <form
                onSubmit={handleCreatePrompt}
                className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4 text-[#27AE60]" />
                  <span>กำหนดชุดคำสั่ง AI สำหรับเอกสารเฉพาะของ บจก. บุรีรัมย์ธงชัยก่อสร้าง</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ชื่อชุดคำสั่ง (Title):
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="เช่น ใบส่งมอบงานรายวัน, สัญญารับเหมาช่วง"
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ประเภทเอกสาร (Doc Type Name):
                    </label>
                    <input
                      type="text"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      placeholder="เช่น ใบส่งมอบงาน, บัตรผ่านสะพาน"
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePrompt(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#27AE60] text-white rounded-lg font-semibold"
                  >
                    บันทึกประเภทเอกสาร
                  </button>
                </div>
              </form>
            )}

            {/* Master-Detail Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* =========================================================
                 LEFT: DOCUMENT TYPES TABLE
                 ========================================================= */}
              <div className="lg:col-span-5 xl:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
                {/* Search & Category Filter */}
                <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promptSearchQuery}
                      onChange={(e) => setPromptSearchQuery(e.target.value)}
                      placeholder="ค้นหาชื่อเอกสาร, รหัส, ม.86/4..."
                      className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#27AE60]"
                    />
                    {promptSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPromptSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Group Filter Pills */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: 'ทั้งหมด', label: 'ทั้งหมด' },
                      { key: 'เอกสารภาษีมูลค่าเพิ่มและหลักฐานภาษีอากร', label: 'VAT/WHT' },
                      { key: 'เอกสารการส่งมอบและหน้างานก่อสร้าง', label: 'ส่งมอบ/ชั่ง' },
                      { key: 'เอกสารจัดซื้อและการค้า', label: 'จัดซื้อ (PO/PR)' },
                      { key: 'เอกสารบันทึกบัญชีภายใน', label: 'บัญชี (PV/PC)' },
                    ].map(({ key, label }) => {
                      const count =
                        key === 'ทั้งหมด'
                          ? prompts.length
                          : prompts.filter((p) => {
                              const docObj = ACCOUNTING_DOC_TYPES.find((d) => d.name === p.doc_type);
                              return docObj?.group === key;
                            }).length;

                      const isSelected = selectedGroup === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedGroup(key)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#27AE60] text-white font-semibold shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{label}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                              isSelected ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Table of Document Types */}
                <div className="overflow-x-auto max-h-[620px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-700 text-[11px] font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">ประเภทเอกสาร</th>
                        <th className="py-2.5 px-2.5 text-center whitespace-nowrap">สถานะภาษี / สิทธิ</th>
                        <th className="py-2.5 px-2 text-right">เวอร์ชัน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPrompts.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-400 text-xs">
                            ไม่พบประเภทเอกสารที่ตรงกับการค้นหา
                          </td>
                        </tr>
                      ) : (
                        filteredPrompts.map((p, pIdx) => {
                          const docTypeObj = ACCOUNTING_DOC_TYPES.find((d) => d.name === p.doc_type);
                          const isSelected = activePrompt?.doc_type === p.doc_type;
                          const isCreditQualified = docTypeObj?.vatQualification === 'CREDIT_QUALIFIED';
                          const isWht = docTypeObj?.vatQualification === 'WHT_APPLICABLE';
                          const isNotCreditable = docTypeObj?.vatQualification === 'NOT_CREDITABLE';

                          return (
                            <tr
                              key={`${p.id || p.doc_type}-${pIdx}`}
                              onClick={() => setSelectedPromptDocType(p.doc_type)}
                              className={`cursor-pointer transition select-none ${
                                isSelected
                                  ? 'bg-emerald-50/90 text-slate-900 border-l-4 border-l-[#27AE60] font-semibold'
                                  : 'hover:bg-slate-50/90 text-slate-700'
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0 mt-0.5">
                                    {docTypeObj?.code || 'DOC'}
                                  </span>
                                  <div>
                                    <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                                      <span>{p.doc_type}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 line-clamp-1">
                                      {docTypeObj?.legalSection || p.legal_reference || 'มาตรฐานจัดซื้อ'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                                {isCreditQualified && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    <span>เคลม VAT ภ.พ.30</span>
                                  </span>
                                )}
                                {isWht && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-blue-100/70 text-blue-800 border border-blue-300">
                                    <Receipt className="w-2.5 h-2.5 text-blue-600" />
                                    <span>หัก ณ ที่จ่าย</span>
                                  </span>
                                )}
                                {isNotCreditable && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-amber-100/70 text-amber-800 border border-amber-300">
                                    <span>ภาษีซื้อต้องห้าม</span>
                                  </span>
                                )}
                                {!isCreditQualified && !isWht && !isNotCreditable && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                    <span>ควบคุมภายใน</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-2 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-50 text-[#27AE60] border border-emerald-200">
                                    v{p.version}
                                  </span>
                                  <ChevronRight
                                    className={`w-3.5 h-3.5 transition ${
                                      isSelected ? 'text-[#27AE60] translate-x-0.5' : 'text-slate-300'
                                    }`}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Left Table Footer */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    แสดง {filteredPrompts.length} จาก {prompts.length} ประเภท
                  </span>
                  <span className="text-emerald-700 font-medium">คลิกแถวเพื่อดูรายละเอียดทางขวา</span>
                </div>
              </div>

              {/* =========================================================
                 RIGHT: DETAIL & MANAGEMENT PANEL FOR SELECTED DOCUMENT
                 ========================================================= */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4">
                {activePrompt ? (
                  <>
                    {/* Header Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                              {activePromptDocObj?.code || 'CUSTOM'}
                            </span>
                            <h4 className="font-bold text-base text-slate-900">{activePrompt.title}</h4>
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-[#27AE60] border border-emerald-200">
                              v{activePrompt.version} พร้อมใช้งาน
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {activePromptDocObj?.description || activePrompt.base_knowledge}
                          </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleResetToStatutory(activePrompt.doc_type)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition"
                            title="รีเซ็ตฟิลด์ตามเกณฑ์สรรพากรและระเบียบจัดซื้อ"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-500" />
                            <span>รีเซ็ตเกณฑ์สรรพากร</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onGeneratePrompt(activePrompt.doc_type)}
                            className="px-3 py-1.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI ปรับปรุงชุดคำสั่ง</span>
                          </button>
                        </div>
                      </div>

                      {/* Statutory & Tax Stance Bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                          <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-950 block">ข้อกฎหมายและมาตรฐานอ้างอิง:</span>
                            <span className="text-amber-900 text-[11px]">
                              {activePromptDocObj?.legalSection || activePrompt.legal_reference || 'มาตรฐานจัดซื้อและระบบควบคุมภายใน'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-950 block">สิทธิทางภาษีและการบันทึกบัญชี:</span>
                            <span className="text-emerald-900 text-[11px]">
                              {activePromptDocObj?.vatQualification === 'CREDIT_QUALIFIED'
                                ? 'มีสิทธินำภาษีซื้อไปหักภาษีขายใน ภ.พ.30 (ม.86/4)'
                                : activePromptDocObj?.vatQualification === 'WHT_APPLICABLE'
                                ? 'ต้องหักภาษี ณ ที่จ่ายตาม ม.3 เตรส และ ม.50 ทวิ'
                                : activePromptDocObj?.vatQualification === 'NOT_CREDITABLE'
                                ? 'ภาษีซื้อต้องห้ามตาม ม.82/5 ลงเป็นค่าใช้จ่ายทั้งจำนวน'
                                : 'เอกสารควบคุมภายในและตรวจรับวัสดุ (TAS 2 / 3-Way Matching)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {activePromptDocObj?.treat_as_scale && (
                        <div className="bg-purple-50 border border-purple-200 text-purple-900 rounded-lg p-2.5 text-xs flex items-center gap-2 font-medium">
                          <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
                          <span>
                            บัตรชั่งน้ำหนักอัตโนมัติ: ระบบ AI จะสกัดน้ำหนักรถเข้า, รถออก และคำนวณน้ำหนักสุทธิเป็น <strong>ตัน</strong> สำหรับตรวจรับวัสดุไซต์งาน
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Field Configuration Matrix */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#27AE60]" />
                            <span>ฟิลด์ที่กำหนดให้ AI สกัดข้อมูลสำหรับ {activePrompt.doc_type}</span>
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            ทำเครื่องหมายถูกที่ฟิลด์ที่ต้องการให้โมเดล AI อ่านค่า (ฟิลด์ที่มีดอกจันสีแดง <span className="text-red-500 font-bold">*</span> เป็นฟิลด์บังคับตามกฎหมาย)
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          เปิดใช้งาน{' '}
                          {Object.values(activePrompt.field_config).filter(Boolean).length} / {STATUTORY_FIELD_DEFINITIONS.length} ฟิลด์
                        </span>
                      </div>

                      {/* Checkbox Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {STATUTORY_FIELD_DEFINITIONS.map((f) => {
                          const isMandatory = activePromptDocObj?.mandatoryFields.includes(f.key);
                          const isChecked = activePrompt.field_config[f.key] === true;

                          return (
                            <label
                              key={f.key}
                              className={`flex items-start gap-2 text-[11px] cursor-pointer select-none p-2 rounded-lg border transition ${
                                isChecked
                                  ? 'bg-emerald-50/50 border-emerald-300 text-slate-900 shadow-2xs'
                                  : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                              title={`${f.label} (${f.desc})`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  onUpdateFieldConfig(activePrompt.doc_type, f.key, e.target.checked)
                                }
                                className="mt-0.5 rounded text-[#27AE60] focus:ring-[#27AE60]"
                              />
                              <div className="leading-tight">
                                <div className="flex items-center gap-1">
                                  <span className={`font-semibold ${isMandatory ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {f.label}
                                  </span>
                                  {isMandatory && (
                                    <span
                                      className="text-red-500 font-bold text-xs"
                                      title="ฟิลด์บังคับตามประมวลรัษฎากร"
                                    >
                                      *
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                                  {f.key}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Full Statutory AI Prompt Code Box */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#27AE60]" />
                          <span>ชุดคำสั่ง AI ระบบ (Statutory Prompt Directive)</span>
                        </h5>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(activePrompt.id, activePrompt.prompt_text)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
                          title="คัดลอกชุดคำสั่งไปใช้งาน"
                        >
                          {copiedPromptId === activePrompt.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#27AE60]" />
                              <span className="text-[#27AE60]">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>คัดลอก Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] max-h-52 overflow-y-auto leading-relaxed custom-scrollbar border border-slate-800 whitespace-pre-wrap select-all">
                          {activePrompt.prompt_text}
                        </pre>
                      </div>
                    </div>

                    {/* Active Learning & Review Board Shortcut */}
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-blue-950 block">
                            ตัวอย่างจริงสำหรับฝึกฝน (Ground Truth): {activePrompt.sample_count} ตัวอย่าง
                          </span>
                          <span className="text-blue-800 text-[11px]">
                            เมื่อเจ้าหน้าที่บัญชีตรวจทานและบันทึกความถูกต้อง ข้อมูลจะนำไปจูน AI ทันที
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const targetType = activePrompt.doc_type;
                          const foundIdx = samples.findIndex((s) => {
                            const st = s.doc_type || s.predicted_doc_type || '';
                            return st === targetType || st.includes(targetType) || targetType.includes(st);
                          });
                          if (foundIdx >= 0) {
                            setSelectedSampleIndex(foundIdx);
                          }
                          setSampleDocType(targetType);
                          setActiveTab('samples');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition shrink-0 shadow-2xs text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>เปิดตรวจทาน Ground Truth</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
                    กรุณาเลือกประเภทเอกสารจากตารางด้านซ้าย
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             TAB 2: SAMPLE REVIEW & ACTIVE LEARNING GROUND TRUTH
             ========================================================= */
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">กระดานตรวจทานความถูกต้องตามประมวลรัษฎากร (Active Learning Board):</span>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                  เมื่อเจ้าหน้าที่ฝ่ายจัดซื้อหรือบัญชีแก้ไขข้อมูลที่ถูกต้องในกระดานนี้ ข้อมูลจะถูกจัดเก็บเป็น{' '}
                  <strong>Ground Truth</strong> และส่งกลับไปฝึกให้ AI
                  จดจำโครงสร้างบิลของร้านค้านี้โดยอัตโนมัติ เพื่อให้การสแกนครั้งต่อไปมีความแม่นยำสูงขึ้น
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Sample List */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-[580px] overflow-y-auto custom-scrollbar">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  ตัวอย่างบิลในระบบ ({samples.length})
                </span>

                {samples.map((s, idx) => {
                  const isSelected = idx === selectedSampleIndex;
                  const isTax = (s.doc_type || s.predicted_doc_type || '').includes('กำกับภาษี');

                  return (
                    <div
                      key={`${s.id || 'sample'}-${idx}`}
                      onClick={() => setSelectedSampleIndex(idx)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer text-xs space-y-1.5 ${
                        isSelected
                          ? 'bg-white border-[#27AE60] ring-1 ring-[#27AE60] shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-800 truncate">
                          {s.store_name || s.ground_truth.store_name || '-'}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            isTax
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {s.doc_type || s.predicted_doc_type || 'ไม่ระบุ'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          {s.date || s.ground_truth.date || '-'} • เลขที่:{' '}
                          <span className="font-mono">{s.doc_no || s.ground_truth.doc_no || '-'}</span>
                        </span>
                        {s.total_amount ? (
                          <span className="font-bold text-slate-800">
                            ฿{s.total_amount.toLocaleString()}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400">สถานะ: {s.status}</span>
                        {s.tax_compliance_check?.is_compliant && (
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ผ่านเกณฑ์ภาษี</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Statutory Ground Truth Review Form */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                {currentSample ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#27AE60]" />
                          <span>ตรวจสอบความถูกต้องตามเกณฑ์สรรพากร (Tax Compliance Review)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ID: <span className="font-mono">{currentSample.id}</span> • ผู้ซื้อ:{' '}
                          <strong>{BTC_COMPANY_INFO.nameTh}</strong> (เลขประจำตัว:{' '}
                          <span className="font-mono">{BTC_COMPANY_INFO.taxId}</span>)
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {currentSample.status}
                        </span>
                      </div>
                    </div>

                    {/* Statutory Verification Box (ม.86/4 Compliance Checklist) */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-[#27AE60]" />
                          <span>เกณฑ์ตรวจสอบตามประมวลรัษฎากร มาตรา 86/4 (สำหรับใบกำกับภาษี):</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {activeDocInfo?.vatQualification === 'CREDIT_QUALIFIED'
                            ? '✅ เอกสารนี้สามารถนำภาษีซื้อมาหักภาษีขายได้'
                            : '⚠️ เอกสารนี้ไม่ใช่ใบกำกับภาษีเต็มรูป (ไม่สามารถเคลม VAT)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              sampleVendorTaxId.length === 13
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            ✓
                          </span>
                          <span>เลข 13 หลักผู้ขาย (13 หลัก): {sampleVendorTaxId || '-'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              sampleTaxInvoiceNo.length > 0
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            ✓
                          </span>
                          <span>เลขที่ใบกำกับภาษี: {sampleTaxInvoiceNo || '-'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              parseFloat(sampleVatAmount) > 0
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            ✓
                          </span>
                          <span>แยกแสดงภาษีมูลค่าเพิ่ม 7%: ฿{sampleVatAmount || '0.00'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500 text-white">
                            ✓
                          </span>
                          <span>เลข 13 หลักผู้ซื้อ BTC: 0315559001144</span>
                        </div>
                      </div>
                    </div>

                    {/* Editable Fields for Human Verification */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          ประเภทเอกสารที่ถูกต้อง:
                        </label>
                        <select
                          value={sampleDocType}
                          onChange={(e) => setSampleDocType(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                        >
                          {ACCOUNTING_DOC_TYPES.map((dt) => (
                            <option key={dt.code} value={dt.name}>
                              {dt.name} ({dt.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          วันที่ตามเอกสาร (YYYY-MM-DD):
                        </label>
                        <input
                          type="date"
                          value={sampleDate}
                          onChange={(e) => setSampleDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          เลขที่เอกสาร / บิลส่งของ (Doc No):
                        </label>
                        <input
                          type="text"
                          value={sampleDocNo}
                          onChange={(e) => setSampleDocNo(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          เลขที่ใบกำกับภาษี (Tax Invoice No):
                        </label>
                        <input
                          type="text"
                          value={sampleTaxInvoiceNo}
                          onChange={(e) => setSampleTaxInvoiceNo(e.target.value)}
                          placeholder="เช่น INV-2026-001"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          ชื่อร้านค้า / ผู้ขาย (Supplier Name):
                        </label>
                        <input
                          type="text"
                          value={sampleStore}
                          onChange={(e) => setSampleStore(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          เลขประจำตัวผู้เสียภาษี 13 หลักของผู้ขาย:
                        </label>
                        <input
                          type="text"
                          maxLength={13}
                          value={sampleVendorTaxId}
                          onChange={(e) => setSampleVendorTaxId(e.target.value)}
                          placeholder="เช่น 0313548000451"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      {/* Tax Breakdown Fields */}
                      <div className="sm:col-span-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-[#27AE60]" />
                            <span>ยอดเงินและภาษีมูลค่าเพิ่ม 7% (Tax &amp; VAT Calculation):</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleAutoCalcTax}
                            className="text-[11px] px-2 py-0.5 bg-white border border-emerald-300 text-[#27AE60] rounded hover:bg-emerald-50 transition font-semibold"
                          >
                            คำนวณ VAT 7% อัตโนมัติ
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">
                              ยอดก่อน VAT (Subtotal):
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={sampleSubtotal}
                              onChange={(e) => setSampleSubtotal(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">
                              ภาษีมูลค่าเพิ่ม 7% (VAT):
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={sampleVatAmount}
                              onChange={(e) => setSampleVatAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white text-emerald-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">
                              ยอดรวมสุทธิทั้งสิ้น (Total):
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={sampleTotal}
                              onChange={(e) => setSampleTotal(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white text-slate-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Weight Ticket Specifics (Optional) */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          น้ำหนักชั่งสุทธิ (ตัน) (ถ้ามี):
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={sampleWeightNet}
                          onChange={(e) => setSampleWeightNet(e.target.value)}
                          placeholder="เช่น 20.30"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          ทะเบียนรถบรรทุก (ถ้ามี):
                        </label>
                        <input
                          type="text"
                          value={sampleVehicle}
                          onChange={(e) => setSampleVehicle(e.target.value)}
                          placeholder="เช่น 82-5541 บุรีรัมย์"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        * ข้อมูลนี้จะถูกบันทึกเป็นแบบเรียนรู้สำหรับโมเดล AI ในประเภท &quot;{sampleDocType}&quot;
                      </span>

                      <button
                        onClick={handleSaveReview}
                        className="px-4 py-2 bg-[#27AE60] hover:bg-[#219653] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>บันทึกเป็น Ground Truth สรรพากร</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    เลือกตัวอย่างจากรายการทางซ้ายเพื่อทำการตรวจทานตามมาตรฐานภาษี
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
