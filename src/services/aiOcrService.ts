import { LineItem, PurchasingDocument, DocumentCategory } from '../types';
import { ACCOUNTING_DOC_TYPES, BTC_COMPANY_INFO } from '../data/constants';

export interface OCRScanResult {
  doc_type: string;
  doc_no: string;
  tax_invoice_no: string;
  po_number: string;
  date: string;
  store_name: string;
  vendor_tax_id?: string;
  vendor_branch?: string;
  vendor_address?: string;
  company_name?: string;
  buyer_tax_id?: string;
  buyer_branch?: string;
  job_name?: string;
  requester?: string;
  pay_approver?: string;
  receiver_name?: string;
  category: DocumentCategory | string;
  items: LineItem[];
  subtotal_amount?: number;
  vat_rate?: number;
  vat_amount?: number;
  total_amount: number;
  wht_rate?: number;
  wht_amount?: number;
  net_paid_amount?: number;
  wht_category?: string;
  scale_weight_in?: number | null;
  scale_weight_out?: number | null;
  scale_weight_net?: number | null;
  vehicle_registration?: string;
  delivery_location?: string;
  is_valid_tax_invoice?: boolean;
  tax_compliance_notes?: string[];
  confidence_score: number;
  match_type: 'AUTO_EXACT' | 'AUTO_SUGGESTED' | 'MANUAL';
  match_reason?: string;
  needs_review: boolean;
  review_reason?: string;
}

export async function scanDocumentWithAI(
  imageBase64: string,
  fileName: string,
  docTypeHint?: string
): Promise<OCRScanResult> {
  // Simulate AI parsing time for smooth UX
  await new Promise(resolve => setTimeout(resolve, 1400));

  const lowerName = (fileName || '').toLowerCase();
  const hint = docTypeHint || '';

  const isWeighTicket = lowerName.includes('scale') || lowerName.includes('wt') || lowerName.includes('ชั่ง') || hint.includes('ชั่ง');
  const isPO = lowerName.includes('po') || lowerName.includes('สั่งซื้อ') || hint.includes('สั่งซื้อ');
  const isWHT = lowerName.includes('wht') || lowerName.includes('50 ทวิ') || lowerName.includes('หัก') || hint.includes('50 ทวิ') || hint.includes('หัก ณ ที่จ่าย');
  const isDO_TAX = lowerName.includes('do/tax') || lowerName.includes('ส่งของ/กำกับ') || hint.includes('ใบส่งของ / ใบกำกับภาษี');
  const isTaxInvoice = lowerName.includes('tax') || lowerName.includes('กำกับ') || hint.includes('ใบกำกับภาษี');
  const isBilling = lowerName.includes('bill') || lowerName.includes('inv') || lowerName.includes('วางบิล') || hint.includes('วางบิล');

  const today = new Date().toISOString().split('T')[0];

  // 1. ใบชั่งน้ำหนัก / บัตรชั่ง
  if (isWeighTicket) {
    return {
      doc_type: 'ใบชั่งน้ำหนัก / บัตรชั่ง',
      doc_no: `WT-${Math.floor(1000 + Math.random() * 9000)}`,
      tax_invoice_no: '',
      po_number: 'PO-6902-002',
      date: today,
      store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
      category: 'วัสดุก่อสร้าง',
      company_name: BTC_COMPANY_INFO.nameTh,
      buyer_tax_id: BTC_COMPANY_INFO.taxId,
      buyer_branch: BTC_COMPANY_INFO.branch,
      job_name: 'งานซ่อมบำรุงผิวทาง บร.3015',
      vehicle_registration: '82-5541 บุรีรัมย์',
      delivery_location: 'หน้างานโครงการ บร.3015 กม.14+200',
      scale_weight_in: 34.20,
      scale_weight_out: 12.10,
      scale_weight_net: 22.10,
      items: [
        {
          name: 'หินคลุก CBR > 80% น้ำหนักชั่งหน้างาน',
          quantity: 22.10,
          unit: 'ตัน',
          price_per_unit: 380,
          total: 8398,
        }
      ],
      total_amount: 8398,
      confidence_score: 96,
      match_type: 'AUTO_EXACT',
      match_reason: 'พบเลข PO-6902-002 ในช่องหมายเหตุของใบชั่ง',
      needs_review: false,
    };
  }

  // 2. หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)
  if (isWHT) {
    const docNo = `WHT-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = 45000;
    const whtAmount = subtotal * 0.03; // 3% ค่าจ้างทำของ
    return {
      doc_type: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)',
      doc_no: docNo,
      tax_invoice_no: '',
      po_number: 'PO-6902-003',
      date: today,
      store_name: 'หจก. บุรีรัมย์ เจริญการช่าง แอนด์ ทรานสปอร์ต',
      vendor_tax_id: '0313551000987',
      vendor_branch: 'สำนักงานใหญ่ (00000)',
      company_name: BTC_COMPANY_INFO.nameTh,
      buyer_tax_id: BTC_COMPANY_INFO.taxId,
      buyer_branch: BTC_COMPANY_INFO.branch,
      job_name: 'งานซ่อมบำรุงผิวทาง บร.3015',
      category: 'ค่าแรง/บริการ',
      wht_category: 'ค่าจ้างทำของและบริการ (3%)',
      subtotal_amount: subtotal,
      wht_rate: 3,
      wht_amount: whtAmount,
      net_paid_amount: subtotal - whtAmount,
      total_amount: subtotal,
      items: [
        {
          name: 'ค่าจ้างเหมาบดอัดและปรับระดับผิวทางลูกรัง',
          quantity: 1,
          unit: 'งาน',
          price_per_unit: subtotal,
          total: subtotal,
        }
      ],
      confidence_score: 97,
      match_type: 'AUTO_EXACT',
      match_reason: 'ตรงตามสัญญาจ้างเหมางานบริการ',
      needs_review: false,
    };
  }

  // 3. ใบส่งของ / ใบกำกับภาษี
  if (isDO_TAX) {
    const invNo = `INV-DO-${Math.floor(10000 + Math.random() * 90000)}`;
    const subtotal = 52000;
    const vat = Math.round(subtotal * 0.07 * 100) / 100;
    return {
      doc_type: 'ใบส่งของ / ใบกำกับภาษี',
      doc_no: invNo,
      tax_invoice_no: invNo,
      po_number: 'PO-6902-001',
      date: today,
      store_name: 'บจก. ซีแพค บุรีรัมย์ คอนกรีต',
      vendor_tax_id: '0105536001234',
      vendor_branch: 'สำนักงานใหญ่ (00000)',
      company_name: BTC_COMPANY_INFO.nameTh,
      buyer_tax_id: BTC_COMPANY_INFO.taxId,
      buyer_branch: BTC_COMPANY_INFO.branch,
      job_name: 'โครงการขยายทางเลี่ยงเมืองบุรีรัมย์',
      category: 'วัสดุก่อสร้าง',
      vehicle_registration: '70-9821 บุรีรัมย์ (รถโม่)',
      delivery_location: 'หน้างาน กม. 12+500 สะพานข้ามทางรถไฟ',
      receiver_name: 'สมศักดิ์ วิศวกรโครงการ',
      subtotal_amount: subtotal,
      vat_rate: 7,
      vat_amount: vat,
      total_amount: subtotal + vat,
      is_valid_tax_invoice: true,
      tax_compliance_notes: ['ครบถ้วน 8 รายการตาม ม.86/4', 'มีลายเซ็นผู้ตรวจรับพัสดุหน้างาน'],
      items: [
        {
          name: 'คอนกรีตผสมเสร็จ 320 ksc Cylinder',
          quantity: 26,
          unit: 'คิว',
          price_per_unit: 2000,
          total: subtotal,
        }
      ],
      confidence_score: 98,
      match_type: 'AUTO_EXACT',
      match_reason: 'ตรงกับใบสั่งซื้อ PO-6902-001 และผ่านเกณฑ์ ม.86/4',
      needs_review: false,
    };
  }

  // 4. ใบสั่งซื้อ (PO)
  if (isPO) {
    const poNum = `PO-6902-${Math.floor(100 + Math.random() * 900)}`;
    const subtotal = 77600;
    const vat = Math.round(subtotal * 0.07 * 100) / 100;
    return {
      doc_type: 'ใบสั่งซื้อ',
      doc_no: poNum,
      tax_invoice_no: '',
      po_number: poNum,
      date: today,
      store_name: 'บจก. สยามวัสดุก่อสร้าง บุรีรัมย์',
      vendor_tax_id: '0315542001999',
      vendor_branch: 'สำนักงานใหญ่ (00000)',
      company_name: BTC_COMPANY_INFO.nameTh,
      buyer_tax_id: BTC_COMPANY_INFO.taxId,
      buyer_branch: BTC_COMPANY_INFO.branch,
      job_name: 'โครงการก่อสร้างสะพานคอนกรีตข้ามลำน้ำชี',
      requester: 'นายสมศักดิ์ วิศวกรโครงการ',
      pay_approver: 'นายธงชัย ชัยพัฒนาพงษ์',
      category: 'วัสดุก่อสร้าง',
      subtotal_amount: subtotal,
      vat_rate: 7,
      vat_amount: vat,
      total_amount: subtotal + vat,
      items: [
        {
          name: 'เหล็กเส้นข้ออ้อย DB20 SD40 มอก.',
          quantity: 120,
          unit: 'เส้น',
          price_per_unit: 620,
          total: 74400,
        },
        {
          name: 'ลวดผูกเหล็ก เบอร์ 18 ตราเสือ',
          quantity: 20,
          unit: 'ขด',
          price_per_unit: 160,
          total: 3200,
        }
      ],
      confidence_score: 98,
      match_type: 'AUTO_EXACT',
      needs_review: false,
    };
  }

  // 5. ใบกำกับภาษีแบบเต็มรูป (ม.86/4)
  if (isTaxInvoice) {
    const invNo = `TAX-${Math.floor(10000 + Math.random() * 90000)}`;
    const subtotal = 13432.71;
    const vat = 940.29;
    const total = 14373;
    return {
      doc_type: 'ใบกำกับภาษีแบบเต็มรูป',
      doc_no: invNo,
      tax_invoice_no: invNo,
      po_number: 'PO-6902-004',
      date: today,
      store_name: 'หจก. บุรีรัมย์ปิโตรเลียม',
      vendor_tax_id: '0313548000451',
      vendor_branch: 'สำนักงานใหญ่ (00000)',
      company_name: BTC_COMPANY_INFO.nameTh,
      buyer_tax_id: BTC_COMPANY_INFO.taxId,
      buyer_branch: BTC_COMPANY_INFO.branch,
      job_name: 'โครงการก่อสร้างสะพานคอนกรีตข้ามลำน้ำชี',
      category: 'น้ำมันเชื้อเพลิง',
      subtotal_amount: subtotal,
      vat_rate: 7,
      vat_amount: vat,
      total_amount: total,
      is_valid_tax_invoice: true,
      tax_compliance_notes: [
        'มีคำว่า "ใบกำกับภาษี" ชัดเจน',
        'เลขประจำตัวผู้เสียภาษี 13 หลักของผู้ซื้อ-ผู้ขาย ครบถ้วน',
        'แยกแสดงภาษีมูลค่าเพิ่ม 7% ถูกต้องตาม ม.86/4',
      ],
      items: [
        {
          name: 'น้ำมันดีเซล B7 เกรดยานพาหนะเครื่องจักรหนัก',
          quantity: 420.26,
          unit: 'ลิตร',
          price_per_unit: 32.00,
          total: 13432.71,
        }
      ],
      confidence_score: 97,
      match_type: 'AUTO_EXACT',
      match_reason: 'ตรงกับใบสั่งซื้อ PO-6902-004 และตรงตามประมวลรัษฎากร ม.86/4',
      needs_review: false,
    };
  }

  // Default: ใบส่งของ / ใบส่งสินค้าชั่วคราว
  const slipNo = `DO-${Math.floor(10000 + Math.random() * 90000)}`;
  return {
    doc_type: 'ใบส่งของ / ใบส่งสินค้าชั่วคราว',
    doc_no: slipNo,
    tax_invoice_no: '',
    po_number: '-',
    date: today,
    store_name: 'ร้าน ธนชัยฮาร์ดแวร์ & เครื่องมือก่อสร้าง',
    category: 'อุปกรณ์ช่าง',
    company_name: BTC_COMPANY_INFO.nameTh,
    buyer_tax_id: BTC_COMPANY_INFO.taxId,
    buyer_branch: BTC_COMPANY_INFO.branch,
    job_name: 'ซ่อมบำรุงเครื่องจักรหน้างาน',
    requester: 'นายประเสริฐ ช่างซ่อม',
    receiver_name: 'นายอนุรักษ์ โฟร์แมน',
    items: [
      {
        name: 'สายส่งน้ำดับเพลิงผ้าใบ 2 นิ้ว พร้อมข้อต่อสวมเร็ว',
        quantity: 2,
        unit: 'ม้วน',
        price_per_unit: 1850,
        total: 3700,
      },
      {
        name: 'ประแจเลื่อนด้ามหุ้มยาง 12 นิ้ว Solo',
        quantity: 3,
        unit: 'อัน',
        price_per_unit: 380,
        total: 1140,
      }
    ],
    total_amount: 4840,
    confidence_score: 91,
    match_type: 'MANUAL',
    needs_review: true,
    review_reason: 'ไม่ระบุเลขที่ PO บนใบส่งของ — ต้องตรวจสอบหรือกำหนด PO ด้วยตนเอง',
  };
}

/**
 * สร้างคำสั่ง AI Prompt ตามข้อกำหนดทางภาษีอากรและประเภทเอกสาร
 */
export function generateStatutoryPrompt(
  docTypeName: string,
  selectedFields: Record<string, boolean>
): string {
  const docTypeInfo = ACCOUNTING_DOC_TYPES.find(d => d.name === docTypeName) || {
    name: docTypeName,
    code: 'CUSTOM',
    legalSection: 'มาตรฐานเอกสารจัดซื้อ',
    vatQualification: 'INTERNAL_CONTROL',
    description: '',
    mandatoryFields: [],
  };

  const activeFieldKeys = Object.entries(selectedFields)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  let prompt = `STATUTORY_AI_PROMPT: ${docTypeName} (${docTypeInfo.code})
ข้อกำหนดกฎหมาย: ${docTypeInfo.legalSection}
สถานะทางภาษี: ${docTypeInfo.vatQualification === 'CREDIT_QUALIFIED' ? 'ขอคืนภาษีซื้อได้ตาม ม.86/4' : docTypeInfo.vatQualification === 'WHT_APPLICABLE' ? 'เอกสารหักภาษี ณ ที่จ่ายตาม ม.50 ทวิ' : 'เอกสารควบคุมภายใน / ไม่ใช่เอกสารภาษี'}

คำสั่งประมวลผลสำหรับ AI โมเดล:
1. ทำการตรวจสอบประเภทเอกสารนี้ว่าเป็น "${docTypeName}" อย่างแท้จริงหรือไม่ หากไม่ใช่ให้ระบุข้อผิดพลาด
2. ดึงข้อมูลตามฟิลด์ต่อไปนี้อย่างเคร่งครัด ห้ามเดาหรือสร้างข้อมูลเท็จ (Hallucination):
${activeFieldKeys.map(k => `   - ${k}`).join('\n')}

เกณฑ์การตรวจสอบทางบัญชีและภาษี (Accounting & Tax Compliance Rules):`;

  if (docTypeInfo.vatQualification === 'CREDIT_QUALIFIED') {
    prompt += `
- ต้องตรวจสอบเลขประจำตัวผู้เสียภาษี 13 หลักของผู้ขาย (vendor_tax_id) และผู้ซื้อ (buyer_tax_id: 0315559001144 บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด)
- ต้องตรวจสอบการระบุ "สำนักงานใหญ่" หรือ "สาขาที่" (vendor_branch, buyer_branch)
- ตรวจสอบการแยกภาษีมูลค่าเพิ่ม 7% (vat_amount) ออกจากยอดก่อนภาษี (subtotal_amount) ชัดเจน
- หากพบว่าขาดรายการใดรายการหนึ่งใน 8 รายการตาม ม.86/4 ให้ตั้ง flag 'needs_review: true'`;
  } else if (docTypeName.includes('ชั่ง')) {
    prompt += `
- น้ำหนักทั้งหมดต้องแปลงเป็นหน่วย "ตัน" ทศนิยม 2-3 ตำแหน่ง (หากเอกสารเป็น กก. ให้หาร 1000)
- บันทึกเลขทะเบียนรถบรรทุก (vehicle_registration) ให้ครบถ้วน
- ห้ามคำนวณราคาหรือยอดเงินเองหากบนใบชั่งไม่มีการระบุราคาต่อหน่วย`;
  } else if (docTypeInfo.vatQualification === 'WHT_APPLICABLE') {
    prompt += `
- ตรวจสอบอัตราหัก ณ ที่จ่าย (wht_rate): ค่าจ้างทำของ 3%, ค่าขนส่ง 1%, ค่าเช่า 5%
- คำนวณตรวจสอบ ยอดจ่ายสุทธิ = ยอดก่อนหักภาษี - ภาษีหัก ณ ที่จ่าย
- ตรวจสอบชื่อผู้มีหน้าที่หัก (BTC: 0315559001144) และผู้ถูกหัก`;
  } else {
    prompt += `
- ดึงเลขที่เอกสาร วันที่ รายการพัสดุ ปริมาณ และหน่วยนับให้ครบถ้วน
- ดึงเลข PO ที่อ้างอิงเพื่อใช้ในระบบ 3-Way Matching`;
  }

  prompt += `\n3. ส่งคืนผลลัพธ์ในรูปแบบ JSON ที่มี schema สอดคล้องกับ PurchasingDocument interface เสมอ`;

  return prompt;
}
