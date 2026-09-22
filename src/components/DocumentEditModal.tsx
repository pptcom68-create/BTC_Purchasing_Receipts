import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, ExternalLink, Calculator, Sparkles } from 'lucide-react';
import { PurchasingDocument, LineItem } from '../types';
import { ACCOUNTING_DOC_TYPES, DOCUMENT_CATEGORIES } from '../data/constants';
import { formatCurrency } from '../utils/formatters';

interface DocumentEditModalProps {
  document: PurchasingDocument | null;
  onClose: () => void;
  onSave: (updatedDoc: PurchasingDocument) => void;
  customDocTypes: string[];
  onAddCustomDocType: (typeName: string) => void;
}

export const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  document: initialDoc,
  onClose,
  onSave,
  customDocTypes,
  onAddCustomDocType,
}) => {
  if (!initialDoc) return null;

  const [docType, setDocType] = useState(initialDoc.doc_type || '');
  const [bookNo, setBookNo] = useState(initialDoc.book_no || '');
  const [docNo, setDocNo] = useState(initialDoc.doc_no || '');
  const [taxInvoiceNo, setTaxInvoiceNo] = useState(initialDoc.tax_invoice_no || '');
  const [refNo, setRefNo] = useState(initialDoc.ref_no || '');
  const [refLabel, setRefLabel] = useState(initialDoc.ref_label || '');
  const [poNumber, setPoNumber] = useState(initialDoc.po_number || '');
  const [date, setDate] = useState(initialDoc.date || '');
  const [storeName, setStoreName] = useState(initialDoc.store_name || '');
  const [vendorTaxId, setVendorTaxId] = useState(initialDoc.vendor_tax_id || '');
  const [vendorBranch, setVendorBranch] = useState(initialDoc.vendor_branch || 'สำนักงานใหญ่ (00000)');
  const [category, setCategory] = useState(initialDoc.category || 'ทั่วไป');
  const [companyName, setCompanyName] = useState(initialDoc.company_name || '');
  const [jobName, setJobName] = useState(initialDoc.job_name || '');
  const [requester, setRequester] = useState(initialDoc.requester || '');
  const [payApprover, setPayApprover] = useState(initialDoc.pay_approver || '');

  // Tax and Financials
  const [subtotalAmount, setSubtotalAmount] = useState<string>(
    initialDoc.subtotal_amount !== undefined ? String(initialDoc.subtotal_amount) : ''
  );
  const [vatAmount, setVatAmount] = useState<string>(
    initialDoc.vat_amount !== undefined ? String(initialDoc.vat_amount) : ''
  );
  const [vatRate, setVatRate] = useState<number>(initialDoc.vat_rate || 7);

  // Weighbridge fields
  const [vehicleRegistration, setVehicleRegistration] = useState(
    initialDoc.vehicle_registration || ''
  );
  const [weightIn, setWeightIn] = useState<string>(
    initialDoc.scale_weight_in !== null && initialDoc.scale_weight_in !== undefined
      ? String(initialDoc.scale_weight_in)
      : ''
  );
  const [weightOut, setWeightOut] = useState<string>(
    initialDoc.scale_weight_out !== null && initialDoc.scale_weight_out !== undefined
      ? String(initialDoc.scale_weight_out)
      : ''
  );
  const [weightNet, setWeightNet] = useState<string>(
    initialDoc.scale_weight_net !== null && initialDoc.scale_weight_net !== undefined
      ? String(initialDoc.scale_weight_net)
      : ''
  );

  // Line items
  const [items, setItems] = useState<LineItem[]>(
    initialDoc.items && initialDoc.items.length > 0
      ? initialDoc.items.map((it) => ({ ...it }))
      : [{ name: '', quantity: 1, unit: 'ชิ้น', price_per_unit: 0, total: 0 }]
  );

  const [totalAmount, setTotalAmount] = useState<number>(initialDoc.total_amount || 0);
  const [isManualTotal, setIsManualTotal] = useState(false);
  const [showAddCustomType, setShowAddCustomType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  // Auto calculate total
  useEffect(() => {
    if (!isManualTotal) {
      const sum = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
      setTotalAmount(sum);
    }
  }, [items, isManualTotal]);

  // Auto calculate net weight if in and out provided
  const handleWeightChange = (inVal: string, outVal: string) => {
    setWeightIn(inVal);
    setWeightOut(outVal);
    const nIn = parseFloat(inVal);
    const nOut = parseFloat(outVal);
    if (!isNaN(nIn) && !isNaN(nOut)) {
      const net = Math.abs(nIn - nOut);
      setWeightNet(net.toFixed(2));
    }
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const nextItems = [...items];
    const current = { ...nextItems[index], [field]: value };

    if (field === 'quantity' || field === 'price_per_unit') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : current.quantity;
      const price = field === 'price_per_unit' ? parseFloat(value) || 0 : current.price_per_unit;
      current.total = Math.round(qty * price * 100) / 100;
    }

    nextItems[index] = current;
    setItems(nextItems);
  };

  const addItemRow = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'หน่วย', price_per_unit: 0, total: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const cleanItems = items.filter((it) => it.name.trim() !== '' || it.total > 0);
    const itemsSummary = cleanItems
      .map((it) => `${it.name} (${it.quantity} ${it.unit})`)
      .join(', ');

    const updated: PurchasingDocument = {
      ...initialDoc,
      doc_type: docType,
      book_no: bookNo.trim(),
      doc_no: docNo.trim(),
      tax_invoice_no: taxInvoiceNo.trim(),
      ref_no: refNo.trim(),
      ref_label: refLabel.trim(),
      po_number: poNumber.trim() || '-',
      date: date || initialDoc.date,
      store_name: storeName.trim() || 'ไม่ระบุร้านค้า',
      vendor_tax_id: vendorTaxId.trim() || undefined,
      vendor_branch: vendorBranch.trim() || undefined,
      category: category,
      company_name: companyName.trim(),
      job_name: jobName.trim(),
      requester: requester.trim(),
      pay_approver: payApprover.trim(),
      vehicle_registration: vehicleRegistration.trim(),
      scale_weight_in: weightIn ? parseFloat(weightIn) : null,
      scale_weight_out: weightOut ? parseFloat(weightOut) : null,
      scale_weight_net: weightNet ? parseFloat(weightNet) : null,
      items: cleanItems,
      items_summary: itemsSummary,
      subtotal_amount: subtotalAmount ? parseFloat(subtotalAmount) : undefined,
      vat_amount: vatAmount ? parseFloat(vatAmount) : undefined,
      vat_rate: vatRate,
      total_amount: Number(totalAmount) || 0,
      is_valid_tax_invoice:
        vendorTaxId.length === 13 && !!taxInvoiceNo && (Number(totalAmount) || 0) > 0,
      needs_review: false, // cleared on user edit
      review_reason: undefined,
    };

    onSave(updated);
  };

  const handleCreateCustomType = () => {
    if (!newTypeName.trim()) return;
    onAddCustomDocType(newTypeName.trim());
    setDocType(newTypeName.trim());
    setNewTypeName('');
    setShowAddCustomType(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded-md font-bold tracking-wide">
              BTC แก้ไขข้อมูลบิล
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              แก้ไขข้อมูลและรายการสินค้าในบิล
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left Column: Reference Document Image */}
          <div className="lg:w-[35%] shrink-0 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col gap-2 min-h-0">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>ภาพบิลอ้างอิงสำหรับตรวจทาน</span>
              {initialDoc.image_url && (
                <a
                  href={initialDoc.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#27AE60] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>ดูภาพใหญ่</span>
                </a>
              )}
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[180px] lg:min-h-0">
              {initialDoc.image_url ? (
                <img
                  src={initialDoc.image_url}
                  alt=""
                  className="w-full h-full object-contain max-h-[46vh] lg:max-h-[66vh] rounded-lg"
                />
              ) : (
                <div className="text-xs text-slate-400">ไม่มีไฟล์ภาพบิล</div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              ตรวจทานตัวเลขและตัวอักษรให้ตรงกับภาพถ่ายบิลจริง
            </p>
          </div>

          {/* Right Column: Edit Form */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {/* Primary Document Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Doc Type */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">ประเภทเอกสาร:</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomType(!showAddCustomType)}
                    className="text-[10px] text-[#27AE60] hover:underline font-medium"
                  >
                    + เพิ่มประเภทใหม่
                  </button>
                </div>
                {showAddCustomType ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="ระบุประเภทใหม่..."
                      className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomType}
                      className="px-2 py-1 bg-[#27AE60] text-white rounded-lg text-xs font-semibold shrink-0"
                    >
                      เพิ่ม
                    </button>
                  </div>
                ) : (
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60]"
                  >
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
                )}
              </div>

              {/* Document Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลขที่เอกสาร:</label>
                <input
                  type="text"
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                  placeholder="เช่น INV-88910"
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>

              {/* Tax Invoice Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่ใบกำกับภาษี:
                </label>
                <input
                  type="text"
                  value={taxInvoiceNo}
                  onChange={(e) => setTaxInvoiceNo(e.target.value)}
                  placeholder="ถ้ามี"
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>

              {/* PO Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลขที่ PO:</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="เช่น PO-6902-001"
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">วันที่ในบิล:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60]"
                >
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Store Name */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อร้านค้า / ซัพพลายเออร์:
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="เช่น บจก. ซีแพค บุรีรัมย์"
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>

              {/* Vendor Tax ID (13 digits) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขประจำตัวผู้เสียภาษี 13 หลัก (ผู้ขาย):
                </label>
                <input
                  type="text"
                  maxLength={13}
                  value={vendorTaxId}
                  onChange={(e) => setVendorTaxId(e.target.value)}
                  placeholder="13 หลัก เช่น 0313548000451"
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>

              {/* Vendor Branch */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">สาขาผู้ขาย:</label>
                <input
                  type="text"
                  value={vendorBranch}
                  onChange={(e) => setVendorBranch(e.target.value)}
                  placeholder="สำนักงานใหญ่ (00000) หรือ สาขาที่ 00001"
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>

              {/* Ref No */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลขอ้างอิงอื่น:</label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="สัญญา/หมายเหตุ"
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#27AE60]"
                />
              </div>
            </div>

            {/* Weighbridge Fields (Show if doc_type is weigh ticket or has weights) */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="font-bold text-sky-900 flex items-center justify-between">
                <span>ข้อมูลใบชั่งน้ำหนักและยานพาหนะ</span>
                <span className="text-[10px] text-sky-700 font-normal">หน่วย: ตัน</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">ทะเบียนรถ:</label>
                  <input
                    type="text"
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value)}
                    placeholder="เช่น 82-5541 บุรีรัมย์"
                    className="w-full px-2.5 py-1.5 border border-sky-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">น้ำหนักเข้า (ตัน):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightIn}
                    onChange={(e) => handleWeightChange(e.target.value, weightOut)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 border border-sky-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">น้ำหนักออก (ตัน):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightOut}
                    onChange={(e) => handleWeightChange(weightIn, e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 border border-sky-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">น้ำหนักสุทธิ (ตัน):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightNet}
                    onChange={(e) => setWeightNet(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 border border-sky-300 rounded-lg text-xs font-mono font-bold text-sky-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Project & Internal Personnel Fields */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="font-bold text-slate-800">ข้อมูลโครงการและการเบิกจ่ายภายใน</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">บริษัทผู้ซื้อ:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="บจก. บุรีรัมย์ธงชัยก่อสร้าง"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">งาน / โครงการ:</label>
                  <input
                    type="text"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="เช่น ขยายทางเลี่ยงเมือง"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">ผู้ขอเบิก:</label>
                  <input
                    type="text"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    placeholder="ชื่อโฟร์แมน / วิศวกร"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">ผู้สั่งจ่าย:</label>
                  <input
                    type="text"
                    value={payApprover}
                    onChange={(e) => setPayApprover(e.target.value)}
                    placeholder="ผู้อนุมัติ"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Editable Line Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  แก้ไขรายการสินค้า / วัสดุ ({items.length} รายการ)
                </span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#27AE60] rounded-lg font-semibold border border-emerald-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มรายการ</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2 w-10 text-center">#</th>
                      <th className="p-2">รายการสินค้า / วัสดุ</th>
                      <th className="p-2 w-20 text-center">จำนวน</th>
                      <th className="p-2 w-20 text-center">หน่วย</th>
                      <th className="p-2 w-28 text-right">ราคา/หน่วย</th>
                      <th className="p-2 w-28 text-right">ราคารวม</th>
                      <th className="p-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            placeholder="ชื่อสินค้า/วัสดุ"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#27AE60]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            step="any"
                            value={sub.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs text-center font-mono focus:ring-1 focus:ring-[#27AE60]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={sub.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            placeholder="คิว/ตัน/ถุง"
                            className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-[#27AE60]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            step="any"
                            value={sub.price_per_unit}
                            onChange={(e) => handleItemChange(idx, 'price_per_unit', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-right font-mono focus:ring-1 focus:ring-[#27AE60]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            step="any"
                            value={sub.total}
                            onChange={(e) => {
                              setIsManualTotal(true);
                              handleItemChange(idx, 'total', parseFloat(e.target.value) || 0);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-right font-mono font-bold text-[#27AE60] focus:ring-1 focus:ring-[#27AE60]"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="ลบแถวนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotal, VAT 7%, and Grand Total */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <Calculator className="w-4 h-4 text-[#27AE60]" />
                    <span>สรุปมูลค่าและภาษีมูลค่าเพิ่ม (ม.86/4):</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sub = parseFloat(subtotalAmount) || totalAmount / 1.07;
                      const vat = Math.round(sub * 0.07 * 100) / 100;
                      setSubtotalAmount(sub.toFixed(2));
                      setVatAmount(vat.toFixed(2));
                      setTotalAmount(Math.round((sub + vat) * 100) / 100);
                      setIsManualTotal(true);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-emerald-300 text-[#27AE60] rounded hover:bg-emerald-50 transition font-semibold"
                  >
                    คำนวณ VAT 7%
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">มูลค่าก่อน VAT:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={subtotalAmount}
                      onChange={(e) => {
                        setSubtotalAmount(e.target.value);
                        setIsManualTotal(true);
                      }}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">ภาษีมูลค่าเพิ่ม 7%:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={vatAmount}
                      onChange={(e) => {
                        setVatAmount(e.target.value);
                        setIsManualTotal(true);
                      }}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">ยอดรวมสุทธิ (Grand Total):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={totalAmount}
                      onChange={(e) => {
                        setIsManualTotal(true);
                        setTotalAmount(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full px-2.5 py-1.5 border border-emerald-300 rounded-lg text-xs font-mono font-bold bg-white text-[#27AE60]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#27AE60] hover:bg-[#219653] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการแก้ไข</span>
          </button>
        </div>
      </div>
    </div>
  );
};
