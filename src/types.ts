import { LucideIcon } from 'lucide-react';

export interface LineItem {
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
}

export type DocumentCategory = 
  | 'วัสดุก่อสร้าง'
  | 'น้ำมันเชื้อเพลิง'
  | 'อุปกรณ์ช่าง'
  | 'ค่าแรง/บริการ'
  | 'ทั่วไป';

export type VatCreditQualification = 
  | 'CREDIT_QUALIFIED' // นำภาษีซื้อมาหักภาษีขายได้ตาม ม.82/5
  | 'NOT_CREDITABLE'   // ไม่สามารถนำภาษีซื้อมาหักได้ (เช่น บิลเงินสด, ใบส่งของ, ภาษีซื้อต้องห้าม)
  | 'WHT_APPLICABLE'   // มีหน้าที่หักภาษี ณ ที่จ่าย ม.3 เตรส, ม.50 ทวิ
  | 'INTERNAL_CONTROL'; // เอกสารควบคุมภายใน ไม่เกี่ยวกับสรรพากรโดยตรง

export interface AccountingDocType {
  name: string;
  code: string;
  group: string;
  vat: string;
  vatQualification: VatCreditQualification;
  legalSection: string; // เช่น 'ประมวลรัษฎากร ม.86/4'
  accountingStandard: string; // เช่น 'TAS 2 / TAS 16 / TFRS for NPAEs'
  description: string;
  is_standard: boolean;
  treat_as_scale?: boolean;
  mandatoryFields: string[]; // ฟิลด์บังคับตามกฎหมาย/มาตรฐาน
  recommendedFields: string[]; // ฟิลด์แนะนำเพื่อการควบคุมภายใน
}

export type MatchType = 'AUTO_EXACT' | 'AUTO_SUGGESTED' | 'MANUAL';

export interface PurchasingDocument {
  id: string;
  doc_key: string;
  doc_type: string;
  book_no?: string;
  doc_no?: string;
  tax_invoice_no?: string;
  ref_no?: string;
  ref_label?: string;
  po_number: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  
  // ผู้ขาย / ซัพพลายเออร์ (ตาม ม.86/4)
  store_name: string;
  vendor_tax_id?: string; // เลขประจำตัวผู้เสียภาษีอากร 13 หลัก
  vendor_branch?: string; // สำนักงานใหญ่ หรือ สาขาที่...
  vendor_address?: string;

  // ผู้ซื้อ / ผู้รับบริการ (บจก. บุรีรัมย์ธงชัยก่อสร้าง ตาม ม.86/4)
  company_name?: string; // บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด
  buyer_tax_id?: string; // 0315559001144
  buyer_branch?: string; // สำนักงานใหญ่ (00000)
  buyer_address?: string;

  // ควบคุมภายในและไซต์งาน
  job_name?: string; // โครงการ / หน้างาน
  requester?: string; // ผู้ขอเบิก / วิศวกร / โฟร์แมน
  pay_approver?: string; // ผู้มีอำนาจสั่งจ่าย
  receiver_name?: string; // ผู้ตรวจรับพัสดุ
  category: DocumentCategory | string;
  items: LineItem[];
  items_summary?: string;

  // รายการเงินและภาษี (ตามมาตรฐานการบัญชีและประมวลรัษฎากร)
  subtotal_amount?: number; // มูลค่าสินค้า/บริการก่อน VAT
  vat_rate?: number; // อัตราภาษีมูลค่าเพิ่ม (ปกติ 7%)
  vat_amount?: number; // จำนวนภาษีมูลค่าเพิ่ม
  total_amount: number; // ยอดรวมสุทธิ (Grand Total)
  wht_rate?: number; // อัตราหัก ณ ที่จ่าย เช่น 1%, 3%, 5%
  wht_amount?: number; // จำนวนภาษีที่หัก ณ ที่จ่าย
  net_paid_amount?: number; // ยอดสุทธิที่ต้องจ่ายจริง (Total - WHT)
  wht_category?: string; // เช่น ค่าจ้างทำของ (3%), ค่าขนส่ง (1%), ค่าเช่า (5%)
  credit_terms_days?: number; // เงื่อนไขเครดิตเทอม เช่น 30 วัน
  due_date?: string; // วันครบกำหนดชำระ

  // ข้อมูลใบชั่งและขนส่งหน้างานก่อสร้าง
  scale_weight_in?: number | null; // ตัน
  scale_weight_out?: number | null; // ตัน
  scale_weight_net?: number | null; // ตัน
  weight_unit?: 'ton' | 'kg';
  vehicle_registration?: string; // เช่น 82-5541 บุรีรัมย์
  driver_name?: string;
  delivery_location?: string;
  project_location?: string;

  // การตรวจทานภาษีและความสมบูรณ์ตาม ม.86/4
  is_valid_tax_invoice?: boolean;
  tax_compliance_notes?: string[];
  
  // Audit & Verification
  needs_review: boolean;
  review_reason?: string;
  confidence_score?: number; // 0-100
  readability?: 'clear' | 'blurry' | 'unreadable';
  match_type?: MatchType;
  match_reason?: string;
  remark_text?: string;
  
  // Media / System
  image_url: string;
  image_original_url?: string;
  google_drive_file_id?: string;
  source?: 'user' | 'group' | 'line_auto' | 'manual';
  sender_name?: string;
  sender_id?: string;
}

export interface DocumentLink {
  id?: number | string;
  po_doc_key: string;
  po_label?: string;
  po_store_name?: string;
  link_doc_key: string;
  link_label?: string;
  link_store_name?: string;
  link_type?: string;
  link_scale_net?: number | null;
  link_vehicle?: string;
  status: 'pending' | 'confirmed';
  match_type: MatchType;
  confidence_score: number;
  remark_text?: string;
  created_at?: string;
  confirmed_at?: string | null;
}

export interface VendorBillingNote {
  id: string;
  vendor_name: string;
  billing_no: string;
  billing_date: string;
  claimed_amount: number;
  matched_amount: number;
  remaining_amount: number;
  status: 'draft' | 'matched' | 'validated' | 'paid' | 'rejected';
  validation_ok: boolean;
  validation_message: string;
  drive_file_id?: string;
  webview_link?: string;
  created_by: string;
  created_at: string;
  receipt_doc_keys: string[];
}

export interface AIPromptSet {
  id: string;
  doc_type: string;
  title: string;
  kind: 'standard' | 'custom';
  status: 'sample_needed' | 'ready' | 'generating';
  prompt_text: string;
  base_knowledge: string;
  field_config: Record<string, boolean>;
  sample_count: number;
  version: number;
  legal_reference?: string;
  vat_qualification?: VatCreditQualification;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AISample {
  id: string;
  doc_type?: string;
  predicted_doc_type?: string;
  drive_file_id: string;
  drive_folder_path?: string;
  ground_truth: Partial<PurchasingDocument>;
  layout_signature?: string;
  status: 'pending' | 'active' | 'archived';
  source?: string;
  created_at?: string;
  store_name?: string;
  date?: string;
  doc_no?: string;
  total_amount?: number;
  tax_compliance_check?: {
    has_mandatory_title: boolean;
    has_seller_tax_id: boolean;
    has_buyer_tax_id: boolean;
    has_vat_breakdown: boolean;
    is_compliant: boolean;
  };
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  gasApiUrl: string;
  geminiApiKey: string;
  driveFolderName: string;
  spreadsheetId: string;
}
