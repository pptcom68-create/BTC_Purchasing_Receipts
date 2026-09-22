import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Plus,
  FileText,
  CheckCircle2,
  RotateCw,
  Scale,
  Receipt,
  Building2,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import { PurchasingDocument, LineItem, DocumentCategory } from '../types';
import { ACCOUNTING_DOC_TYPES, DOCUMENT_CATEGORIES, BTC_COMPANY_INFO } from '../data/constants';
import { scanDocumentWithAI } from '../services/aiOcrService';
import { formatCurrency } from '../utils/formatters';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDoc: PurchasingDocument) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form State
  const [docType, setDocType] = useState('ใบสั่งซื้อ');
  const [docNo, setDocNo] = useState(`PO-6902-${Math.floor(100 + Math.random() * 900)}`);
  const [taxInvoiceNo, setTaxInvoiceNo] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeName, setStoreName] = useState('');
  const [vendorTaxId, setVendorTaxId] = useState('');
  const [vendorBranch, setVendorBranch] = useState('สำนักงานใหญ่ (00000)');
  const [category, setCategory] = useState<DocumentCategory>('วัสดุก่อสร้าง');
  const [companyName, setCompanyName] = useState(BTC_COMPANY_INFO.nameTh);
  const [buyerTaxId, setBuyerTaxId] = useState(BTC_COMPANY_INFO.taxId);
  const [buyerBranch, setBuyerBranch] = useState(BTC_COMPANY_INFO.branch);
  const [jobName, setJobName] = useState('โครงการก่อสร้างทางหลวงบุรีรัมย์');
  const [requester, setRequester] = useState('ฝ่ายจัดซื้อ');
  const [payApprover, setPayApprover] = useState('นายธงชัย ชัยพัฒนาพงษ์');

  // Weighbridge fields
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [weightIn, setWeightIn] = useState('');
  const [weightOut, setWeightOut] = useState('');
  const [weightNet, setWeightNet] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  // Tax and Financials
  const [subtotalAmount, setSubtotalAmount] = useState<string>('');
  const [vatRate, setVatRate] = useState<number>(7);
  const [vatAmount, setVatAmount] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [isManualFinancials, setIsManualFinancials] = useState<boolean>(false);

  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    { name: '', quantity: 1, unit: 'หน่วย', price_per_unit: 0, total: 0 },
  ]);

  const activeDocInfo = ACCOUNTING_DOC_TYPES.find((d) => d.name === docType);
  const isTaxDoc = activeDocInfo?.vatQualification === 'CREDIT_QUALIFIED';
  const isScaleDoc = activeDocInfo?.treat_as_scale || docType.includes('ชั่ง');

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setIsScanning(true);

      try {
        const result = await scanDocumentWithAI(base64, file.name, docType);
        setDocType(result.doc_type);
        setDocNo(result.doc_no);
        if (result.tax_invoice_no) setTaxInvoiceNo(result.tax_invoice_no);
        setPoNumber(result.po_number);
        setDate(result.date);
        setStoreName(result.store_name);
        if (result.vendor_tax_id) setVendorTaxId(result.vendor_tax_id);
        if (result.vendor_branch) setVendorBranch(result.vendor_branch);
        setCategory(result.category as DocumentCategory);
        if (result.company_name) setCompanyName(result.company_name);
        if (result.buyer_tax_id) setBuyerTaxId(result.buyer_tax_id);
        if (result.job_name) setJobName(result.job_name);
        if (result.requester) setRequester(result.requester);
        if (result.pay_approver) setPayApprover(result.pay_approver);
        if (result.vehicle_registration) setVehicleRegistration(result.vehicle_registration);
        if (result.delivery_location) setDeliveryLocation(result.delivery_location);
        if (result.scale_weight_net) setWeightNet(String(result.scale_weight_net));
        if (result.scale_weight_in) setWeightIn(String(result.scale_weight_in));
        if (result.scale_weight_out) setWeightOut(String(result.scale_weight_out));
        if (result.items && result.items.length > 0) setItems(result.items);

        if (result.subtotal_amount !== undefined) setSubtotalAmount(String(result.subtotal_amount));
        if (result.vat_amount !== undefined) setVatAmount(String(result.vat_amount));
        if (result.total_amount) setTotalAmount(String(result.total_amount));
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const next = [...items];
    const curr = { ...next[index], [field]: value };
    if (field === 'quantity' || field === 'price_per_unit') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : curr.quantity;
      const p = field === 'price_per_unit' ? parseFloat(value) || 0 : curr.price_per_unit;
      curr.total = Math.round(q * p * 100) / 100;
    }
    next[index] = curr;
    setItems(next);

    // Auto update totals if not manually overridden
    if (!isManualFinancials) {
      const sum = next.reduce((acc, it) => acc + (it.total || 0), 0);
      if (isTaxDoc) {
        const vat = Math.round(sum * 0.07 * 100) / 100;
        setSubtotalAmount(String(sum));
        setVatAmount(String(vat));
        setTotalAmount(String(Math.round((sum + vat) * 100) / 100));
      } else {
        setTotalAmount(String(sum));
      }
    }
  };

  const addItemRow = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'หน่วย', price_per_unit: 0, total: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  // Recalculate VAT 7%
  const handleCalculateVat = () => {
    const sub = parseFloat(subtotalAmount);
    if (!isNaN(sub) && sub > 0) {
      const vat = Math.round(sub * (vatRate / 100) * 100) / 100;
      setVatAmount(String(vat));
      setTotalAmount(String(Math.round((sub + vat) * 100) / 100));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = items.filter((it) => it.name.trim() !== '' || it.total > 0);
    const sum = cleanItems.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const summary = cleanItems
      .map((it) => `${it.name} (${it.quantity} ${it.unit})`)
      .join(', ');

    const sub = parseFloat(subtotalAmount) || (isTaxDoc ? sum : undefined);
    const vat = parseFloat(vatAmount) || (isTaxDoc ? Math.round(sum * 0.07 * 100) / 100 : undefined);
    const finalTotal = parseFloat(totalAmount) || (isTaxDoc && sub && vat ? sub + vat : sum);

    const newId = `doc-${Date.now()}`;
    const newDoc: PurchasingDocument = {
      id: newId,
      doc_key: `DOC:${docType.includes('สั่งซื้อ') ? 'PO' : docType.includes('ชั่ง') ? 'WT' : docType.includes('กำกับ') ? 'TAX' : 'GEN'}::${docNo || newId}`,
      doc_type: docType,
      doc_no: docNo.trim(),
      tax_invoice_no: taxInvoiceNo.trim() || undefined,
      po_number: poNumber.trim() || (docType.includes('สั่งซื้อ') ? docNo.trim() : '-'),
      date: date,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      store_name: storeName.trim() || 'ไม่ระบุร้านค้า',
      vendor_tax_id: vendorTaxId.trim() || undefined,
      vendor_branch: vendorBranch.trim() || undefined,
      category: category,
      company_name: companyName.trim(),
      buyer_tax_id: buyerTaxId.trim(),
      buyer_branch: buyerBranch.trim(),
      job_name: jobName.trim(),
      requester: requester.trim(),
      pay_approver: payApprover.trim(),
      delivery_location: deliveryLocation.trim() || undefined,
      vehicle_registration: vehicleRegistration.trim() || undefined,
      scale_weight_in: weightIn ? parseFloat(weightIn) : null,
      scale_weight_out: weightOut ? parseFloat(weightOut) : null,
      scale_weight_net: weightNet ? parseFloat(weightNet) : null,
      items: cleanItems,
      items_summary: summary,
      subtotal_amount: sub,
      vat_rate: isTaxDoc ? vatRate : undefined,
      vat_amount: vat,
      total_amount: finalTotal,
      is_valid_tax_invoice: isTaxDoc && vendorTaxId.length === 13 && !!taxInvoiceNo,
      needs_review: false,
      confidence_score: 100,
      image_url:
        selectedImage ||
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      source: 'manual',
      sender_name: 'ฝ่ายจัดซื้อ (หน้าเว็บ)',
    };

    onSave(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="bg-[#27AE60] text-white text-xs px-2.5 py-1 rounded-md font-bold tracking-wide">
              BTC นำเข้าเอกสาร
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              สร้างเอกสารจัดซื้อใหม่ / สแกนบิลด้วย AI ตามมาตรฐานภาษี
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                mode === 'upload'
                  ? 'bg-white text-[#27AE60] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>สแกนบิลด้วย AI (แนะนำ)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                mode === 'manual'
                  ? 'bg-white text-[#27AE60] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>กรอกข้อมูลด้วยตนเอง</span>
            </button>
          </div>

          {/* AI Upload Box */}
          {mode === 'upload' && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#27AE60]" />
                  <span>อัปโหลดรูปภาพบิล / ตั๋วชั่ง / ใบกำกับภาษี</span>
                </span>
                <span className="text-[11px] text-emerald-700">
                  ระบบจำแนกและดึงฟิลด์ตามเกณฑ์ประมวลรัษฎากรอัตโนมัติ
                </span>
              </div>

              <div className="border-2 border-dashed border-emerald-300 rounded-xl p-5 text-center bg-white/80 hover:bg-white transition cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <RotateCw className="w-7 h-7 text-[#27AE60] animate-spin" />
                    <span className="text-xs font-bold text-slate-700">
                      AI กำลังอ่านข้อมูลตามประมวลรัษฎากร ม.86/4 และจับคู่ PO...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 space-y-1 text-xs">
                    <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="font-semibold text-slate-700">
                      คลิกเพื่อเลือกไฟล์ หรือลากวางที่นี่
                    </span>
                    <span className="text-[11px] text-slate-500">
                      รองรับ JPG, PNG, ใบกำกับภาษี, บัตรชั่ง, ใบส่งของ
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doc Type Selection & Statutory Badge */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#27AE60]" />
                <span>ประเภทเอกสารตามมาตรฐานบัญชีและภาษีอากร:</span>
              </span>

              {activeDocInfo && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  {activeDocInfo.legalSection}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลือกประเภทเอกสาร:
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-[#27AE60]"
                >
                  {ACCOUNTING_DOC_TYPES.map((dt) => (
                    <option key={dt.code} value={dt.name}>
                      {dt.name} ({dt.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่งาน/พัสดุ:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#27AE60]"
                >
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Statutory description notice */}
            {activeDocInfo && (
              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">{activeDocInfo.vat}: </span>
                  <span>{activeDocInfo.description}</span>
                </div>
              </div>
            )}
          </div>

          {/* Core Metadata Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เลขที่เอกสาร:</label>
              <input
                type="text"
                value={docNo}
                onChange={(e) => setDocNo(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลขที่ใบกำกับภาษี (ถ้ามี):
              </label>
              <input
                type="text"
                value={taxInvoiceNo}
                onChange={(e) => setTaxInvoiceNo(e.target.value)}
                placeholder="เช่น TAX-2026-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลขที่ PO อ้างอิง (สำหรับ Matching):
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="เช่น PO-6902-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                วันที่ในบิล (YYYY-MM-DD):
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อร้านค้า / ซัพพลายเออร์:
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="เช่น บจก. ซีแพค บุรีรัมย์"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลขประจำตัวผู้เสียภาษี 13 หลักของผู้ขาย:
              </label>
              <input
                type="text"
                maxLength={13}
                value={vendorTaxId}
                onChange={(e) => setVendorTaxId(e.target.value)}
                placeholder="13 หลัก เช่น 0315542001999"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Construction & Site Info (Weigh Ticket / Delivery) */}
          {(isScaleDoc || docType.includes('ส่งของ')) && (
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2 text-xs">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-purple-700" />
                <span>ข้อมูลขนส่งและชั่งน้ำหนักหน้างานก่อสร้าง:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    ทะเบียนรถบรรทุก:
                  </label>
                  <input
                    type="text"
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value)}
                    placeholder="เช่น 82-5541 บุรีรัมย์"
                    className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    น้ำหนักชั่งเข้า (ตัน):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightIn}
                    onChange={(e) => {
                      setWeightIn(e.target.value);
                      const wI = parseFloat(e.target.value);
                      const wO = parseFloat(weightOut);
                      if (!isNaN(wI) && !isNaN(wO)) {
                        setWeightNet(Math.abs(wI - wO).toFixed(2));
                      }
                    }}
                    placeholder="เช่น 32.40"
                    className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    น้ำหนักชั่งออก (ตัน):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightOut}
                    onChange={(e) => {
                      setWeightOut(e.target.value);
                      const wI = parseFloat(weightIn);
                      const wO = parseFloat(e.target.value);
                      if (!isNaN(wI) && !isNaN(wO)) {
                        setWeightNet(Math.abs(wI - wO).toFixed(2));
                      }
                    }}
                    placeholder="เช่น 12.10"
                    className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    น้ำหนักสุทธิ (ตัน):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightNet}
                    onChange={(e) => setWeightNet(e.target.value)}
                    placeholder="เช่น 20.30"
                    className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs bg-white font-mono font-bold text-purple-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financials & VAT Breakdown */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#27AE60]" />
                <span>การคำนวณมูลค่าและภาษีมูลค่าเพิ่ม 7% (ม.86/4):</span>
              </span>

              <button
                type="button"
                onClick={handleCalculateVat}
                className="text-[11px] px-2 py-0.5 bg-white border border-emerald-300 text-[#27AE60] rounded hover:bg-emerald-50 transition font-semibold"
              >
                คำนวณ VAT 7% จากยอดก่อนภาษี
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                  มูลค่าก่อนภาษี (Subtotal):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={subtotalAmount}
                  onChange={(e) => {
                    setIsManualFinancials(true);
                    setSubtotalAmount(e.target.value);
                  }}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                  ภาษีมูลค่าเพิ่ม 7% (VAT):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={vatAmount}
                  onChange={(e) => {
                    setIsManualFinancials(true);
                    setVatAmount(e.target.value);
                  }}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                  ยอดรวมทั้งสิ้น (Grand Total):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => {
                    setIsManualFinancials(true);
                    setTotalAmount(e.target.value);
                  }}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">รายการสินค้า/บริการ:</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-[11px] text-[#27AE60] hover:text-[#219653] font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <tr>
                    <th className="p-2.5">ชื่อรายการ</th>
                    <th className="p-2.5 w-24">จำนวน</th>
                    <th className="p-2.5 w-20">หน่วย</th>
                    <th className="p-2.5 w-28">ราคา/หน่วย</th>
                    <th className="p-2.5 w-28 text-right">รวม (บาท)</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          placeholder="ชื่อสินค้า/วัสดุ"
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={it.quantity || ''}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={it.price_per_unit || ''}
                          onChange={(e) => handleItemChange(idx, 'price_per_unit', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800">
                        ฿{it.total.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#27AE60] hover:bg-[#219653] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกเอกสารเข้าระบบ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
