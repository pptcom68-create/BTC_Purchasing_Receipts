import { PurchasingDocument, DocumentLink, VendorBillingNote, AIPromptSet, AISample } from '../types';

export const INITIAL_DOCUMENTS: PurchasingDocument[] = [
  // PO 1: คอนกรีตผสมเสร็จ & ปูนซีเมนต์
  {
    id: 'doc-po-001',
    doc_key: 'DOC:PO::PO-6902-001',
    doc_type: 'ใบสั่งซื้อ',
    doc_no: 'PO-6902-001',
    po_number: 'PO-6902-001',
    date: '2026-09-10',
    timestamp: '2026-09-10 09:30:00',
    store_name: 'บจก. ซีแพค บุรีรัมย์ คอนกรีต',
    vendor_tax_id: '0105536001234',
    company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    job_name: 'โครงการขยายทางเลี่ยงเมืองบุรีรัมย์ กม. 12+400',
    requester: 'นายสมศักดิ์ วิศวกรคุมงาน',
    pay_approver: 'นายธงชัย ชัยพัฒนาพงษ์',
    category: 'วัสดุก่อสร้าง',
    items: [
      {
        name: 'คอนกรีตผสมเสร็จ 35 Mpa (357 ksc ทรงกระบอก)',
        quantity: 80,
        unit: 'คิว',
        price_per_unit: 1950,
        total: 156000,
      },
      {
        name: 'ปูนซีเมนต์ไฮดรอลิก ตราเสือ ซูเปอร์',
        quantity: 200,
        unit: 'ถุง',
        price_per_unit: 145,
        total: 29000,
      }
    ],
    items_summary: 'คอนกรีตผสมเสร็จ 35 Mpa (80 คิว), ปูนซีเมนต์ไฮดรอลิก ตราเสือ (200 ถุง)',
    total_amount: 185000,
    vat_amount: 12950,
    project_location: 'หน้างานก่อสร้างทางหลวงบุรีรัมย์',
    needs_review: false,
    confidence_score: 98,
    match_type: 'AUTO_EXACT',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    image_original_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    source: 'user',
    sender_name: 'สมศักดิ์ (จัดซื้อหน้างาน)',
    sender_id: 'U1001',
  },
  // Delivery Slip 1 (Matching PO 1)
  {
    id: 'doc-do-001',
    doc_key: 'DOC:DO::DO-88910',
    doc_type: 'ใบส่งของ / ใบกำกับภาษี',
    doc_no: 'DO-88910',
    tax_invoice_no: 'INV-TAX-260901',
    po_number: 'PO-6902-001',
    ref_no: 'PO-6902-001',
    ref_label: 'PO',
    date: '2026-09-12',
    timestamp: '2026-09-12 11:15:00',
    store_name: 'บจก. ซีแพค บุรีรัมย์ คอนกรีต',
    vendor_tax_id: '0105536001234',
    company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    job_name: 'โครงการขยายทางเลี่ยงเมืองบุรีรัมย์ กม. 12+400',
    requester: 'นายสมศักดิ์ วิศวกรคุมงาน',
    category: 'วัสดุก่อสร้าง',
    items: [
      {
        name: 'คอนกรีตผสมเสร็จ 35 Mpa (357 ksc ทรงกระบอก)',
        quantity: 40,
        unit: 'คิว',
        price_per_unit: 1950,
        total: 78000,
      }
    ],
    items_summary: 'คอนกรีตผสมเสร็จ 35 Mpa (งวดที่ 1/2) (40 คิว)',
    total_amount: 78000,
    vat_amount: 5460,
    project_location: 'หน้างานขยายทางเลี่ยงเมือง',
    needs_review: false,
    confidence_score: 95,
    match_type: 'AUTO_EXACT',
    match_reason: 'เลขที่ PO ตรงกับ PO-6902-001',
    image_url: 'https://images.unsplash.com/photo-1554415707-9e4c97984f47?w=800&auto=format&fit=crop&q=80',
    source: 'group',
    sender_name: 'พนักงานขับรถขนส่ง ซีแพค',
  },
  // PO 2: หินคลุกและแอสฟัลต์ พร้อมชั่งน้ำหนัก
  {
    id: 'doc-po-002',
    doc_key: 'DOC:PO::PO-6902-002',
    doc_type: 'ใบสั่งซื้อ',
    doc_no: 'PO-6902-002',
    po_number: 'PO-6902-002',
    date: '2026-09-14',
    timestamp: '2026-09-14 08:45:00',
    store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    vendor_tax_id: '0315548002345',
    company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    job_name: 'งานซ่อมบำรุงผิวทาง บร.3015 บ้านกระสัง',
    requester: 'นายอนุรักษ์ โฟร์แมน',
    pay_approver: 'นายธงชัย ชัยพัฒนาพงษ์',
    category: 'วัสดุก่อสร้าง',
    items: [
      {
        name: 'หินคลุก CBR > 80% ชั้นรองพื้นทาง',
        quantity: 150,
        unit: 'ตัน',
        price_per_unit: 380,
        total: 57000,
      },
      {
        name: 'หิน 1/2 นิ้ว งานแอสฟัลติกคอนกรีต',
        quantity: 80,
        unit: 'ตัน',
        price_per_unit: 420,
        total: 33600,
      }
    ],
    items_summary: 'หินคลุก CBR > 80% (150 ตัน), หิน 1/2 นิ้ว (80 ตัน)',
    total_amount: 90600,
    needs_review: false,
    confidence_score: 96,
    match_type: 'AUTO_EXACT',
    image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80',
    source: 'user',
    sender_name: 'อนุรักษ์ (โฟร์แมน)',
  },
  // Weigh Ticket 1 (Matching PO 2)
  {
    id: 'doc-wt-001',
    doc_key: 'DOC:WT::WT-2609-089',
    doc_type: 'ใบชั่งน้ำหนัก / บัตรชั่ง',
    doc_no: 'WT-2609-089',
    ref_no: 'PO-6902-002',
    ref_label: 'หมายเหตุ/PO',
    po_number: 'PO-6902-002',
    date: '2026-09-15',
    timestamp: '2026-09-15 13:20:00',
    store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    job_name: 'งานซ่อมบำรุงผิวทาง บร.3015',
    category: 'วัสดุก่อสร้าง',
    vehicle_registration: '82-5541 บุรีรัมย์ (รถสิบล้อ)',
    scale_weight_in: 32.45,
    scale_weight_out: 12.15,
    scale_weight_net: 20.30,
    weight_unit: 'ton',
    items: [
      {
        name: 'หินคลุก CBR > 80% น้ำหนักชั่งสุทธิ',
        quantity: 20.3,
        unit: 'ตัน',
        price_per_unit: 380,
        total: 7714,
      }
    ],
    items_summary: 'หินคลุก (ชั่งเข้า 32.45 ตัน, ออก 12.15 ตัน, สุทธิ 20.30 ตัน)',
    total_amount: 7714,
    needs_review: false,
    confidence_score: 94,
    match_type: 'AUTO_EXACT',
    match_reason: 'พบเลข PO ในช่องหมายเหตุใบชั่งตรงกับ PO-6902-002',
    image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    source: 'group',
    sender_name: 'คนขับรถสิบล้อ บบ-5541',
  },
  // Delivery Note 2 (Unmatched or Soft Matched)
  {
    id: 'doc-do-002',
    doc_key: 'DOC:DO::DN-9011',
    doc_type: 'ใบส่งของ / ใบส่งสินค้าชั่วคราว',
    doc_no: 'DN-9011',
    po_number: '-',
    date: '2026-09-16',
    timestamp: '2026-09-16 10:05:00',
    store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    category: 'วัสดุก่อสร้าง',
    items: [
      {
        name: 'หิน 1/2 นิ้ว งานแอสฟัลติกคอนกรีต',
        quantity: 35,
        unit: 'ตัน',
        price_per_unit: 420,
        total: 14700,
      }
    ],
    items_summary: 'หิน 1/2 นิ้ว เที่ยวที่ 1 (35 ตัน)',
    total_amount: 14700,
    needs_review: true,
    review_reason: 'ไม่พบเลขที่ PO บนหัวบิล — AI แนะนำจับคู่กับ PO-6902-002 จากชื่อร้านและรายการหิน',
    confidence_score: 82,
    match_type: 'AUTO_SUGGESTED',
    match_reason: 'ร้านค้าตรงกัน (โรงโม่หินศิลาศุภกิจ) และมีรายการหิน 1/2 นิ้วตรงกับ PO-6902-002',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=80',
    source: 'user',
    sender_name: 'นายช่างสมควร',
  },
  // PO 3: เหล็กเส้นก่อสร้างและลวดผูกเหล็ก
  {
    id: 'doc-po-003',
    doc_key: 'DOC:PO::PO-6902-003',
    doc_type: 'ใบสั่งซื้อ',
    doc_no: 'PO-6902-003',
    po_number: 'PO-6902-003',
    date: '2026-09-17',
    timestamp: '2026-09-17 14:10:00',
    store_name: 'บจก. บุรีรัมย์โลหะภัณฑ์และเหล็กไทย',
    vendor_tax_id: '0315539003456',
    company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    job_name: 'งานโครงสร้างสะพานข้ามทางรถไฟ สาย บร.1002',
    requester: 'นายสมศักดิ์ วิศวกรคุมงาน',
    pay_approver: 'นายธงชัย ชัยพัฒนาพงษ์',
    category: 'วัสดุก่อสร้าง',
    items: [
      {
        name: 'เหล็กเส้นข้ออ้อย DB16 SD40T มอก. ความยาว 10 ม.',
        quantity: 250,
        unit: 'เส้น',
        price_per_unit: 415,
        total: 103750,
      },
      {
        name: 'เหล็กเส้นกลม RB9 SR24 มอก. ความยาว 10 ม.',
        quantity: 180,
        unit: 'เส้น',
        price_per_unit: 178,
        total: 32040,
      },
      {
        name: 'ลวดผูกเหล็ก เบอร์ 18 ตราเพชร (มัดละ 2.5 กก.)',
        quantity: 40,
        unit: 'ขด',
        price_per_unit: 165,
        total: 6600,
      }
    ],
    items_summary: 'เหล็กข้ออ้อย DB16 (250 เส้น), เหล็กกลม RB9 (180 เส้น), ลวดผูกเหล็ก (40 ขด)',
    total_amount: 142390,
    vat_amount: 9967.30,
    needs_review: false,
    confidence_score: 99,
    match_type: 'AUTO_EXACT',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    source: 'user',
    sender_name: 'สมศักดิ์ (วิศวกร)',
  },
  // Fuel Receipt
  {
    id: 'doc-fuel-001',
    doc_key: 'DOC:TAX::PTT-BR-8921',
    doc_type: 'ใบกำกับภาษีแบบเต็มรูป',
    doc_no: 'PTT-BR-8921',
    tax_invoice_no: 'PTT-BR-8921',
    po_number: '-',
    date: '2026-09-18',
    timestamp: '2026-09-18 16:30:00',
    store_name: 'หจก. บุรีรัมย์ปิโตรเลียม (ปั๊ม ปตท. สาขาเลี่ยงเมือง)',
    vendor_tax_id: '0313551000987',
    company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
    job_name: 'เติมน้ำมันเครื่องจักรหน้างาน (รถแบคโฮ CAT 320)',
    requester: 'นายประเสริฐ พนักงานขับเครื่องจักร',
    category: 'น้ำมันเชื้อเพลิง',
    vehicle_registration: 'ตค 4490 บุรีรัมย์',
    items: [
      {
        name: 'น้ำมันดีเซลหมุนเร็ว B7 (เติมเข้าถังรถขุด)',
        quantity: 450,
        unit: 'ลิตร',
        price_per_unit: 31.94,
        total: 14373,
      }
    ],
    items_summary: 'น้ำมันดีเซลหมุนเร็ว B7 (450 ลิตร)',
    total_amount: 14373,
    vat_amount: 940.30,
    needs_review: false,
    confidence_score: 97,
    match_type: 'MANUAL',
    image_url: 'https://images.unsplash.com/photo-1527018607616-a6b07c825a07?w=800&auto=format&fit=crop&q=80',
    source: 'group',
    sender_name: 'ประเสริฐ (พขร. เครื่องจักร)',
  },
  // Equipment / Tools Bill
  {
    id: 'doc-tool-001',
    doc_key: 'DOC:REC::TC-99120',
    doc_type: 'ใบเสร็จรับเงิน',
    doc_no: 'TC-99120',
    po_number: '-',
    date: '2026-09-19',
    timestamp: '2026-09-19 11:00:00',
    store_name: 'ร้าน ธนชัยฮาร์ดแวร์ & เครื่องมือก่อสร้าง',
    category: 'อุปกรณ์ช่าง',
    job_name: 'เบิกเครื่องมืองานซ่อมบำรุงแคมป์คนงาน',
    requester: 'นายช่างสนอง',
    items: [
      {
        name: 'ใบเจียรเหล็ก 4 นิ้ว BOSCH (กล่องละ 25 ใบ)',
        quantity: 4,
        unit: 'กล่อง',
        price_per_unit: 580,
        total: 2320,
      },
      {
        name: 'ลวดเชื่อม KOBE-30 ขนาด 2.6 มม.',
        quantity: 5,
        unit: 'กล่อง',
        price_per_unit: 420,
        total: 2100,
      },
      {
        name: 'ถุงมือผ้าถักหนา 7 ขีด (โหลละ 12 คู่)',
        quantity: 10,
        unit: 'โหล',
        price_per_unit: 150,
        total: 1500,
      }
    ],
    items_summary: 'ใบเจียร 4" (4 กล่อง), ลวดเชื่อม KOBE-30 (5 กล่อง), ถุงมือผ้า (10 โหล)',
    total_amount: 5920,
    needs_review: false,
    confidence_score: 93,
    match_type: 'MANUAL',
    image_url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
    source: 'user',
    sender_name: 'สนอง (ช่างซ่อมบำรุง)',
  }
];

export const INITIAL_LINKS: DocumentLink[] = [
  {
    id: 1,
    po_doc_key: 'DOC:PO::PO-6902-001',
    po_label: 'ใบสั่งซื้อ PO-6902-001',
    po_store_name: 'บจก. ซีแพค บุรีรัมย์ คอนกรีต',
    link_doc_key: 'DOC:DO::DO-88910',
    link_label: 'ใบส่งของ / ใบกำกับภาษี DO-88910',
    link_store_name: 'บจก. ซีแพค บุรีรัมย์ คอนกรีต',
    link_type: 'ใบส่งของ / ใบกำกับภาษี',
    status: 'confirmed',
    match_type: 'AUTO_EXACT',
    confidence_score: 0.98,
    remark_text: 'เลขที่ PO ตรงกับ PO-6902-001',
    created_at: '2026-09-12 11:20:00',
    confirmed_at: '2026-09-12 14:00:00',
  },
  {
    id: 2,
    po_doc_key: 'DOC:PO::PO-6902-002',
    po_label: 'ใบสั่งซื้อ PO-6902-002',
    po_store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    link_doc_key: 'DOC:WT::WT-2609-089',
    link_label: 'ใบชั่งน้ำหนัก WT-2609-089',
    link_store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    link_type: 'ใบชั่งน้ำหนัก / บัตรชั่ง',
    link_scale_net: 20.30,
    link_vehicle: '82-5541 บุรีรัมย์',
    status: 'confirmed',
    match_type: 'AUTO_EXACT',
    confidence_score: 0.96,
    remark_text: 'หมายเลข PO บนใบชั่งตรงกับ PO-6902-002',
    created_at: '2026-09-15 13:25:00',
    confirmed_at: '2026-09-15 17:00:00',
  },
  {
    id: 3,
    po_doc_key: 'DOC:PO::PO-6902-002',
    po_label: 'ใบสั่งซื้อ PO-6902-002',
    po_store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    link_doc_key: 'DOC:DO::DN-9011',
    link_label: 'ใบส่งของ DN-9011',
    link_store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    link_type: 'ใบส่งของ / ใบส่งสินค้าชั่วคราว',
    status: 'pending',
    match_type: 'AUTO_SUGGESTED',
    confidence_score: 0.85,
    remark_text: 'ชื่อร้านค้าตรงกัน และมีรายการหิน 1/2 นิ้ว สอดคล้องกับ PO',
    created_at: '2026-09-16 10:10:00',
    confirmed_at: null,
  }
];

export const INITIAL_VENDOR_BILLINGS: VendorBillingNote[] = [
  {
    id: 'bill-note-001',
    vendor_name: 'บจก. ซีแพค บุรีรัมย์ คอนกรีต',
    billing_no: 'VN-2609-01',
    billing_date: '2026-09-20',
    claimed_amount: 78000,
    matched_amount: 78000,
    remaining_amount: 0,
    status: 'validated',
    validation_ok: true,
    validation_message: 'ยอดใบวางบิลตรงกับบิลที่จับคู่แล้ว (DO-88910)',
    created_by: 'นางสาววิไลลักษณ์ การเงิน',
    created_at: '2026-09-20 10:30:00',
    receipt_doc_keys: ['DOC:DO::DO-88910'],
    webview_link: 'https://images.unsplash.com/photo-1554415707-9e4c97984f47?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'bill-note-002',
    vendor_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    billing_no: 'VN-2609-02',
    billing_date: '2026-09-21',
    claimed_amount: 22414,
    matched_amount: 7714,
    remaining_amount: 14700,
    status: 'matched',
    validation_ok: false,
    validation_message: 'ยอดไม่ตรงกัน: ส่วนต่าง ฿14,700 (รอตรวจสอบและยืนยันใบส่งของ DN-9011)',
    created_by: 'นางสาววิไลลักษณ์ การเงิน',
    created_at: '2026-09-21 09:15:00',
    receipt_doc_keys: ['DOC:WT::WT-2609-089'],
  }
];

export const INITIAL_PROMPT_SETS: AIPromptSet[] = [
  {
    id: 'prompt-set-tax-full',
    doc_type: 'ใบกำกับภาษีแบบเต็มรูป',
    title: 'ใบกำกับภาษีแบบเต็มรูป (ม.86/4)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 86/4',
    vat_qualification: 'CREDIT_QUALIFIED',
    prompt_text: `STATUTORY_PROMPT_V4:ใบกำกับภาษีแบบเต็มรูป
ข้อกำหนดตามประมวลรัษฎากร มาตรา 86/4 (บังคับ 8 รายการ):
1. ต้องมีคำว่า "ใบกำกับภาษี" ชัดเจน
2. เลขที่และเล่มที่ (ถ้ามี) ของใบกำกับภาษี (tax_invoice_no)
3. วัน เดือน ปี ที่ออกใบกำกับภาษี (date)
4. ชื่อ ที่อยู่ และเลขประจำตัวผู้เสียภาษีอากร 13 หลักของผู้ขาย (vendor_tax_id) พร้อมระบุสำนักงานใหญ่/สาขา (vendor_branch)
5. ชื่อ ที่อยู่ และเลขประจำตัวผู้เสียภาษีอากร 13 หลักของผู้ซื้อ (buyer_tax_id: 0315559001144 บจก. บุรีรัมย์ธงชัยก่อสร้าง) พร้อมระบุสำนักงานใหญ่/สาขา (buyer_branch)
6. ชื่อ ชนิด ประเภท ปริมาณ และมูลค่าของสินค้าหรือบริการ (items)
7. จำนวนภาษีมูลค่าเพิ่มที่คำนวณจากมูลค่าสินค้า โดยแยกออกจากมูลค่าสินค้าให้เห็นชัดแจ้ง (vat_amount)
8. มูลค่ารวมทั้งสิ้น (total_amount) และมูลค่าก่อนภาษี (subtotal_amount)
* ห้ามเดาเลข 13 หลัก หากเลือนลางให้ระบุ needs_review = true`,
    base_knowledge: 'เอกสารขอคืน/เครดิตภาษีซื้อ (ภ.พ.30) ตาม ม.86/4 ต้องมีเลข 13 หลักผู้ซื้อ-ผู้ขาย และแยกแสดงภาษีมูลค่าเพิ่ม 7% ชัดเจน',
    field_config: {
      doc_type: true,
      tax_invoice_no: true,
      date: true,
      store_name: true,
      vendor_tax_id: true,
      vendor_branch: true,
      company_name: true,
      buyer_tax_id: true,
      buyer_branch: true,
      items: true,
      subtotal_amount: true,
      vat_amount: true,
      total_amount: true,
      po_number: true,
    },
    sample_count: 5,
    version: 4,
  },
  {
    id: 'prompt-set-do-tax',
    doc_type: 'ใบส่งของ / ใบกำกับภาษี',
    title: 'ใบส่งของ / ใบกำกับภาษี (DO/TAX)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 86/4 & คำสั่ง ป.86/2542',
    vat_qualification: 'CREDIT_QUALIFIED',
    prompt_text: `STATUTORY_PROMPT_V4:ใบส่งของ_ใบกำกับภาษี
เอกสารควบรวมที่ใช้ตรวจรับของหน้างานก่อสร้างและใช้เป็นหลักฐานภาษีซื้อ:
1. อ่านเลขที่ใบกำกับภาษี และเลขที่ใบส่งของ
2. ตรวจสอบเลข 13 หลักทั้งผู้ขายและผู้ซื้อ (BTC)
3. ตรวจสอบทะเบียนรถบรรทุกขนส่ง (vehicle_registration) และสถานที่จัดส่ง (delivery_location)
4. รายการวัสดุ/สินค้า ปริมาณ หน่วยนับ และการแยก VAT 7%
5. ต้องระบุชื่อหรือลายเซ็นผู้ตรวจรับพัสดุหน้างาน (receiver_name) เพื่อความสมบูรณ์ในการควบคุมภายใน`,
    base_knowledge: 'เอกสารคู่ค้าก่อสร้าง (ปูน หิน ทราย ยางมะตอย) มีทั้งฟังก์ชันตรวจรับสินค้าและสิทธิภาษีซื้อในใบเดียวกัน',
    field_config: {
      doc_type: true,
      tax_invoice_no: true,
      doc_no: true,
      date: true,
      po_number: true,
      store_name: true,
      vendor_tax_id: true,
      vendor_branch: true,
      company_name: true,
      buyer_tax_id: true,
      items: true,
      subtotal_amount: true,
      vat_amount: true,
      total_amount: true,
      vehicle_registration: true,
      delivery_location: true,
      receiver_name: true,
    },
    sample_count: 4,
    version: 4,
  },
  {
    id: 'prompt-set-do',
    doc_type: 'ใบส่งของ / ใบส่งสินค้าชั่วคราว',
    title: 'ใบส่งของ / ใบส่งสินค้าชั่วคราว (DO)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'สัญญาซื้อขายและระบบควบคุมภายในพัสดุ (TAS 2)',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบส่งของ_ชั่วคราว
เอกสารหลักฐานการส่งมอบสินค้าหน้างาน (ไม่ใช่เอกสารภาษี ห้ามนำไปเคลม VAT):
1. เลขที่ใบส่งของ (doc_no) และวันที่ส่ง (date)
2. เลขที่ PO ที่อ้างอิง (po_number) เพื่อนำไปจับคู่ (Matching)
3. ทะเบียนรถบรรทุกส่งของ (vehicle_registration)
4. รายการพัสดุก่อสร้าง ปริมาณ และหน่วยนับ
5. ผู้รับของ/วิศวกร/โฟร์แมนหน้างาน
* ยอดเงินไม่ใช่ฟิลด์บังคับในใบส่งของ ห้ามคำนวณยอดเงินเองหากไม่มีพิมพ์ไว้`,
    base_knowledge: 'เอกสารควบคุมการรับพัสดุหน้างาน โฟร์แมนต้องตรวจนับจำนวนตรงตามสั่ง นำไปจับคู่กับใบวางบิลและใบกำกับภาษีในภายหลัง',
    field_config: {
      doc_type: true,
      doc_no: true,
      po_number: true,
      date: true,
      store_name: true,
      items: true,
      vehicle_registration: true,
      delivery_location: true,
      receiver_name: true,
      job_name: true,
    },
    sample_count: 3,
    version: 3,
  },
  {
    id: 'prompt-set-wt',
    doc_type: 'ใบชั่งน้ำหนัก / บัตรชั่ง',
    title: 'ใบชั่งน้ำหนัก / ตั๋วชั่ง (WT)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'มาตรฐานทางหลวงและวิศวกรรมควบคุมปริมาณวัสดุมวลรวม',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบชั่งน้ำหนัก
บัตรชั่งน้ำหนักหน้างานก่อสร้าง (หินคลุก หิน 3/4 ทราย ยางมะตอย ดิน):
1. เลขที่บัตรชั่ง (doc_no) และวันเวลาชั่ง
2. ทะเบียนรถบรรทุก (vehicle_registration)
3. น้ำหนักรวมเข้า (scale_weight_in), น้ำหนักรถเปล่าออก (scale_weight_out), และน้ำหนักสุทธิ (scale_weight_net)
4. แปลงหน่วยเป็น "ตัน" เสมอ (หากพิมพ์เป็น กก. ให้หาร 1000)
5. เลข PO หรือหมายเหตุโครงการที่ระบุบนบัตรชั่ง`,
    base_knowledge: 'หลักฐานการส่งมอบวัสดุมวลรวมตามน้ำหนักจริง ใช้เปรียบเทียบกับปริมาณในใบสั่งซื้อและบิลเรียกเก็บเงิน',
    field_config: {
      doc_type: true,
      doc_no: true,
      po_number: true,
      date: true,
      store_name: true,
      vehicle_registration: true,
      scale_weight_in: true,
      scale_weight_out: true,
      scale_weight_net: true,
      items: true,
      job_name: true,
    },
    sample_count: 3,
    version: 3,
  },
  {
    id: 'prompt-set-po',
    doc_type: 'ใบสั่งซื้อ',
    title: 'ใบสั่งซื้อ (Purchase Order - PO)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ระบบการจัดซื้อและการควบคุมภายใน (Internal Control)',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบสั่งซื้อ
เอกสารข้อผูกพันทางการค้าของ BTC ก่อนรับของ:
1. เลขที่ PO (po_number) และวันที่เปิด PO (date)
2. ร้านค้า/ซัพพลายเออร์ที่สั่งซื้อ (store_name)
3. โครงการ/ไซต์งาน (job_name) และสถานที่ส่งมอบ
4. รายการพัสดุ สเปก จำนวน หน่วย ราคาต่อหน่วย และยอดรวม
5. การคำนวณ VAT 7% และยอดสุทธิ
6. ผู้ขอเบิก (requester) และผู้อนุมัติสั่งจ่าย (pay_approver)`,
    base_knowledge: 'เอกสารแกนหลัก (Master Document) ของฝ่ายจัดซื้อ ใช้เป็นตัวตั้งในการจับคู่ (Matching) กับเอกสารหน้างานทุกฉบับ',
    field_config: {
      doc_type: true,
      po_number: true,
      date: true,
      store_name: true,
      company_name: true,
      job_name: true,
      items: true,
      subtotal_amount: true,
      vat_amount: true,
      total_amount: true,
      requester: true,
      pay_approver: true,
      credit_terms_days: true,
    },
    sample_count: 5,
    version: 4,
  },
  {
    id: 'prompt-set-wht',
    doc_type: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)',
    title: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย (ม.50 ทวิ)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 50 ทวิ, คำสั่ง ท.ป.4/2528',
    vat_qualification: 'WHT_APPLICABLE',
    prompt_text: `STATUTORY_PROMPT_V4:หนังสือรับรองหักณที่จ่าย_50ทวิ
เอกสารภาษีหัก ณ ที่จ่ายตามประมวลรัษฎากร:
1. เลขที่เอกสาร (doc_no) และวันที่จ่ายเงิน (date)
2. ผู้มีหน้าที่หักภาษี (BTC เลขผู้เสียภาษี 0315559001144)
3. ผู้ถูกหักภาษี: ชื่อ ที่อยู่ และเลขประจำตัวผู้เสียภาษี 13 หลัก (vendor_tax_id)
4. ประเภทเงินได้พึงประเมิน: ค่าจ้างทำของ/บริการ (3%), ค่าขนส่ง (1%), ค่าเช่า (5%)
5. จำนวนเงินที่จ่าย (subtotal_amount)
6. อัตราภาษี (wht_rate) และภาษีที่หักและนำส่ง (wht_amount)
7. จำนวนเงินสุทธิที่จ่ายจริง (net_paid_amount = subtotal - wht)`,
    base_knowledge: 'เอกสารหักภาษีเพื่อนำส่งกรมสรรพากรด้วยแบบ ภ.ง.ด.3 หรือ ภ.ง.ด.53 ภายในวันที่ 7 ของเดือนถัดไป',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      store_name: true,
      vendor_tax_id: true,
      company_name: true,
      buyer_tax_id: true,
      subtotal_amount: true,
      wht_rate: true,
      wht_amount: true,
      net_paid_amount: true,
      wht_category: true,
      pay_approver: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-rec',
    doc_type: 'ใบเสร็จรับเงิน',
    title: 'ใบเสร็จรับเงิน (Official Receipt - ม.105)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 105, 105 ทวิ',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบเสร็จรับเงิน
หลักฐานการรับเงินตามประมวลรัษฎากร มาตรา 105:
1. ต้องมีคำว่า "ใบเสร็จรับเงิน"
2. เลขที่และเล่มที่ (ถ้ามี)
3. วัน เดือน ปี ที่รับเงิน
4. ชื่อ ที่อยู่ หรือเลขประจำตัวผู้เสียภาษีของผู้รับเงิน (store_name, vendor_tax_id)
5. ชื่อผู้จ่ายเงิน (BTC: บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด)
6. จำนวนเงินที่รับทั้งตัวเลขและตัวอักษร (total_amount)`,
    base_knowledge: 'หลักฐานการรับชำระหนี้ตามกฎหมาย ปลดเปลื้องหนี้การค้าให้สมบูรณ์',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      store_name: true,
      vendor_tax_id: true,
      company_name: true,
      total_amount: true,
      po_number: true,
      ref_no: true,
    },
    sample_count: 3,
    version: 3,
  },
  {
    id: 'prompt-set-cn',
    doc_type: 'ใบลดหนี้',
    title: 'ใบลดหนี้ (Credit Note - ม.86/10)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 86/10',
    vat_qualification: 'CREDIT_QUALIFIED',
    prompt_text: `STATUTORY_PROMPT_V4:ใบลดหนี้
เอกสารลดหย่อนภาษีซื้อและยอดซื้อตามประมวลรัษฎากร:
1. คำว่า "ใบลดหนี้"
2. เลขที่และเล่มที่ใบลดหนี้ (doc_no)
3. วัน เดือน ปี ที่ออกใบลดหนี้
4. เลขที่ใบกำกับภาษีเดิมที่อ้างอิง (ref_no)
5. เหตุผลการออกใบลดหนี้ (เช่น ส่งคืนสินค้า, สินค้าชำรุด, คำนวณราคาสูงเกินจริง)
6. มูลค่าสินค้าเดิม, มูลค่าที่ถูกต้อง, ผลต่างมูลค่า และผลต่างภาษีมูลค่าเพิ่ม (vat_amount)
7. ชื่อ ที่อยู่ เลขประจำตัวผู้เสียภาษีของผู้ซื้อและผู้ขาย`,
    base_knowledge: 'ต้องนำไปกรอกในรายงานภาษีซื้อเดือนที่ได้รับเอกสาร เพื่อลดยอดภาษีซื้อที่เคยขอเครดิตไว้',
    field_config: {
      doc_type: true,
      doc_no: true,
      ref_no: true,
      date: true,
      store_name: true,
      vendor_tax_id: true,
      company_name: true,
      buyer_tax_id: true,
      subtotal_amount: true,
      vat_amount: true,
      total_amount: true,
      remark_text: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-inv-bill',
    doc_type: 'ใบแจ้งหนี้ / ใบวางบิล',
    title: 'ใบแจ้งหนี้ / ใบวางบิล (Billing Note)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลกฎหมายแพ่งและพาณิชย์ & บัญชีเจ้าหนี้การค้า',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบแจ้งหนี้_ใบวางบิล
เอกสารสรุปรอบการเรียกเก็บเงินของซัพพลายเออร์:
1. เลขที่ใบวางบิล (doc_no)
2. วันที่วางบิล และวันครบกำหนดชำระ (due_date)
3. ชื่อร้านค้าผู้ขาย (store_name)
4. รายการใบส่งของและใบกำกับภาษีที่นำมารวมวางบิล (ref_no, items)
5. ยอดรวมเรียกเก็บทั้งสิ้น (total_amount)
6. ยอดภาษีหัก ณ ที่จ่ายที่คาดว่าจะถูกหัก (wht_amount) และยอดสุทธิที่เรียกเก็บ (net_paid_amount)`,
    base_knowledge: 'ใช้ประกอบการทำ 3-Way Matching ตรวจสอบยอดเรียกเก็บเทียบกับบิลส่งของที่ตรวจรับจริงหน้างาน',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      due_date: true,
      store_name: true,
      company_name: true,
      total_amount: true,
      wht_amount: true,
      net_paid_amount: true,
      po_number: true,
      ref_no: true,
    },
    sample_count: 3,
    version: 3,
  },
  {
    id: 'prompt-set-tax-abb',
    doc_type: 'ใบกำกับภาษีอย่างย่อ',
    title: 'ใบกำกับภาษีอย่างย่อ (Abbreviated Tax Invoice - ม.86/6)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 86/6, มาตรา 82/5 (6)',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบกำกับภาษีอย่างย่อ
เอกสารออกโดยเครื่องบันทึกการเก็บเงินหรือผู้ประกอบการค้าปลีก:
1. คำว่า "ใบกำกับภาษีอย่างย่อ"
2. เลขที่เอกสาร (doc_no) และวันเดือนปีที่ออก (date)
3. ชื่อและเลขประจำตัวผู้เสียภาษี 13 หลักของผู้ขาย (vendor_tax_id)
4. ราคาสินค้าหรือบริการรวมภาษีมูลค่าเพิ่มแล้ว (total_amount)
* ต้องห้ามนำภาษีซื้อไปหักภาษีขายในแบบ ภ.พ.30 เด็ดขาด บันทึกเป็นค่าใช้จ่ายทั้งจำนวน`,
    base_knowledge: 'ภาษีซื้อต้องห้ามตาม ม.82/5 (6) ลงเป็นค่าใช้จ่ายทั้งยอดรวม VAT',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      store_name: true,
      vendor_tax_id: true,
      total_amount: true,
      items: true,
      category: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-rec-tax',
    doc_type: 'ใบเสร็จรับเงิน / ใบกำกับภาษี',
    title: 'ใบเสร็จรับเงิน / ใบกำกับภาษี (Receipt & Tax Invoice)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 86/4 & มาตรา 105',
    vat_qualification: 'CREDIT_QUALIFIED',
    prompt_text: `STATUTORY_PROMPT_V4:ใบเสร็จรับเงิน_ใบกำกับภาษี
เอกสารควบรวมหลักฐานรับเงินสดและภาษีซื้อ:
1. คำว่า "ใบเสร็จรับเงิน / ใบกำกับภาษี"
2. เลขที่ใบกำกับภาษี (tax_invoice_no)
3. เลข 13 หลักผู้ขาย (vendor_tax_id) และสาขาผู้ขาย
4. เลข 13 หลักผู้ซื้อ (0315559001144 บจก. บุรีรัมย์ธงชัยก่อสร้าง) และสาขาสำนักงานใหญ่
5. มูลค่าก่อนภาษี (subtotal_amount), ภาษีมูลค่าเพิ่ม 7% (vat_amount) และยอดรวมสุทธิ (total_amount)`,
    base_knowledge: 'หลักฐานภาษีซื้อสมบูรณ์ที่ออกทันทีเมื่อมีการชำระเงินสดหรือบัตรเครดิต เช่น ค่าน้ำมัน ค่าวัสดุซื้อหน้าร้าน',
    field_config: {
      doc_type: true,
      tax_invoice_no: true,
      date: true,
      store_name: true,
      vendor_tax_id: true,
      vendor_branch: true,
      company_name: true,
      buyer_tax_id: true,
      buyer_branch: true,
      items: true,
      subtotal_amount: true,
      vat_amount: true,
      total_amount: true,
      po_number: true,
    },
    sample_count: 3,
    version: 3,
  },
  {
    id: 'prompt-set-dn',
    doc_type: 'ใบเพิ่มหนี้',
    title: 'ใบเพิ่มหนี้ (Debit Note - ม.86/9)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลรัษฎากร มาตรา 86/9',
    vat_qualification: 'CREDIT_QUALIFIED',
    prompt_text: `STATUTORY_PROMPT_V4:ใบเพิ่มหนี้
เอกสารเพิ่มยอดซื้อและภาษีซื้อ:
1. คำว่า "ใบเพิ่มหนี้"
2. เลขที่ใบเพิ่มหนี้ (doc_no) และวันที่ออก (date)
3. เลขที่ใบกำกับภาษีเดิมที่อ้างอิง (ref_no)
4. เหตุผลการออกใบเพิ่มหนี้ (คำนวณราคาสินค้าต่ำไป หรือส่งสินค้าเกินจำนวน)
5. ผลต่างมูลค่า และภาษีมูลค่าเพิ่มส่วนต่างที่ต้องนำไปเคลมภาษีซื้อเพิ่ม (vat_amount)
6. เลข 13 หลักผู้ซื้อและผู้ขาย`,
    base_knowledge: 'นำภาษีซื้อส่วนเพิ่มไปลงในรายงานภาษีซื้อของเดือนที่ได้รับเอกสาร',
    field_config: {
      doc_type: true,
      doc_no: true,
      ref_no: true,
      date: true,
      store_name: true,
      vendor_tax_id: true,
      company_name: true,
      buyer_tax_id: true,
      subtotal_amount: true,
      vat_amount: true,
      total_amount: true,
      remark_text: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-sub-rec',
    doc_type: 'ใบรับรองแทนใบเสร็จรับเงิน (บก.111)',
    title: 'ใบรับรองแทนใบเสร็จรับเงิน (บก.111)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'คู่มือการจัดทำเอกสารประกอบการลงบัญชี สรรพากร',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบรับรองแทนใบเสร็จรับเงิน_บก111
เอกสารรับรองรายจ่ายสำหรับผู้ขายที่ไม่สามารถออกใบเสร็จได้:
1. เลขที่เอกสาร (doc_no) และวันที่จ่าย (date)
2. ชื่อและที่อยู่ของผู้รับเงิน (store_name)
3. รายการค่าใช้จ่าย และยอดเงินที่จ่ายจริง (total_amount)
4. ชื่อผู้เบิกจ่าย (requester) และผู้อนุมัติจ่าย (pay_approver)
5. หมายเหตุคำชี้แจงความจำเป็นที่ไม่สามารถเรียกใบเสร็จรับเงินได้`,
    base_knowledge: 'ใช้เป็นรายจ่ายทางภาษีเงินได้นิติบุคคลของบริษัทตามประมวลรัษฎากร',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      store_name: true,
      total_amount: true,
      requester: true,
      pay_approver: true,
      remark_text: true,
    },
    sample_count: 1,
    version: 1,
  },
  {
    id: 'prompt-set-grn',
    doc_type: 'ใบตรวจรับพัสดุ / งานจ้าง (GRN)',
    title: 'ใบตรวจรับพัสดุ / งานจ้าง (Goods Receipt Note)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ระเบียบการบริหารพัสดุและระบบควบคุมภายใน (TAS 2)',
    vat_qualification: 'INTERNAL_CONTROL',
    prompt_text: `STATUTORY_PROMPT_V4:ใบตรวจรับพัสดุ_GRN
เอกสารตรวจรับงานของวิศวกรและคณะกรรมการหน้างาน:
1. เลขที่ใบตรวจรับ (doc_no) และวันที่ตรวจรับ (date)
2. เลขที่ PO ที่อ้างอิง (po_number)
3. ร้านค้า/ผู้รับเหมา (store_name) และชื่อโครงการ (job_name)
4. รายการพัสดุ ปริมาณที่ตรวจรับ และการประเมินคุณภาพ
5. ลายเซ็นผู้ตรวจรับพัสดุ (receiver_name) และผู้รับทราบ (pay_approver)`,
    base_knowledge: 'เอกสารสำคัญในการทำ 3-Way Matching คู่กับ PO และใบแจ้งหนี้เพื่อตั้งหนี้ในระบบบัญชี',
    field_config: {
      doc_type: true,
      doc_no: true,
      po_number: true,
      date: true,
      store_name: true,
      job_name: true,
      items: true,
      receiver_name: true,
      pay_approver: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-pr',
    doc_type: 'ใบขอซื้อ / ใบขอเบิกพัสดุ (PR)',
    title: 'ใบขอซื้อ / ใบขอเบิกพัสดุ (Purchase Requisition)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ระเบียบการจัดซื้อและงบประมาณโครงการภายใน',
    vat_qualification: 'INTERNAL_CONTROL',
    prompt_text: `STATUTORY_PROMPT_V4:ใบขอซื้อ_PR
เอกสารความต้องการจัดซื้อจากไซต์งาน:
1. เลขที่ PR (doc_no) และวันที่ขอ (date)
2. โครงการ/หน่วยงานที่ขอ (job_name)
3. ผู้ขอเบิก (requester)
4. รายการวัสดุ สเปก และปริมาณที่ต้องการ (items)`,
    base_knowledge: 'เอกสารเริ่มต้นก่อนฝ่ายจัดซื้อดำเนินการขอราคาและเปิด PO',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      job_name: true,
      requester: true,
      items: true,
      po_number: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-qt',
    doc_type: 'ใบเสนอราคา',
    title: 'ใบเสนอราคา (Quotation)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ประมวลกฎหมายแพ่งและพาณิชย์ (คำเสนอ)',
    vat_qualification: 'NOT_CREDITABLE',
    prompt_text: `STATUTORY_PROMPT_V4:ใบเสนอราคา
เอกสารข้อเสนอทางการค้าจากคู่ค้า:
1. เลขที่ใบเสนอราคา (doc_no) และวันที่เสนอ (date)
2. ชื่อร้านค้าผู้เสนอราคา (store_name)
3. รายการพัสดุ ราคาต่อหน่วย ยอดรวม และระยะเวลายืนราคา
4. เงื่อนไขการชำระเงินและเครดิตเทอม (credit_terms_days)`,
    base_knowledge: 'ใช้เปรียบเทียบราคาคู่เทียบอย่างน้อย 3 รายการตามระเบียบจัดซื้อ',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      store_name: true,
      items: true,
      total_amount: true,
      credit_terms_days: true,
      vat_amount: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-pv',
    doc_type: 'ใบสำคัญจ่าย',
    title: 'ใบสำคัญจ่าย (Payment Voucher - PV)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'พ.ร.บ. การบัญชี พ.ศ. 2543 (ม.12)',
    vat_qualification: 'INTERNAL_CONTROL',
    prompt_text: `STATUTORY_PROMPT_V4:ใบสำคัญจ่าย_PV
เอกสารทางบัญชีเพื่อการอนุมัติจ่ายเงิน:
1. เลขที่ใบสำคัญจ่าย (doc_no) และวันที่จ่าย (date)
2. ผู้รับเงิน (store_name) และโครงการที่ตัดจ่าย (job_name)
3. ยอดจ่ายทั้งสิ้น (total_amount), ภาษีหัก ณ ที่จ่าย (wht_amount), ยอดจ่ายสุทธิ (net_paid_amount)
4. ผู้จัดทำ (requester) และผู้มีอำนาจอนุมัติสั่งจ่าย (pay_approver)`,
    base_knowledge: 'เอกสารรวมชุดหลักฐานสั่งจ่ายเงินของฝ่ายการเงินและบัญชี',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      store_name: true,
      total_amount: true,
      wht_amount: true,
      net_paid_amount: true,
      requester: true,
      pay_approver: true,
      job_name: true,
    },
    sample_count: 2,
    version: 2,
  },
  {
    id: 'prompt-set-pc',
    doc_type: 'ใบเบิกเงินสดย่อย',
    title: 'ใบเบิกเงินสดย่อย (Petty Cash Voucher - PC)',
    kind: 'standard',
    status: 'ready',
    legal_reference: 'ระเบียบการบริหารกองทุนเงินสดย่อยภายใน',
    vat_qualification: 'INTERNAL_CONTROL',
    prompt_text: `STATUTORY_PROMPT_V4:ใบเบิกเงินสดย่อย_PC
เอกสารเบิกจ่ายค่าใช้จ่ายเงินสดหน้างาน:
1. เลขที่ใบเบิกเงินสดย่อย (doc_no) และวันที่เบิก (date)
2. ผู้ขอเบิก (requester) และผู้อนุมัติ (pay_approver)
3. รายละเอียดค่าใช้จ่ายและยอดเงินรวม (total_amount)
4. หมายเหตุโครงการก่อสร้าง (job_name, remark_text)`,
    base_knowledge: 'เอกสารประกอบการชดเชยเงินสดย่อย (Imprest Fund)',
    field_config: {
      doc_type: true,
      doc_no: true,
      date: true,
      total_amount: true,
      requester: true,
      pay_approver: true,
      remark_text: true,
      job_name: true,
    },
    sample_count: 2,
    version: 2,
  },
];

export const INITIAL_SAMPLES: AISample[] = [
  {
    id: 'sample-001',
    doc_type: 'ใบกำกับภาษีแบบเต็มรูป',
    predicted_doc_type: 'ใบกำกับภาษีแบบเต็มรูป',
    drive_file_id: '1aB2cD3eF4gH5iJ6kL7mN8oP',
    ground_truth: {
      doc_type: 'ใบกำกับภาษีแบบเต็มรูป',
      tax_invoice_no: 'PTT-BR-8921',
      doc_no: 'PTT-BR-8921',
      date: '2026-09-18',
      store_name: 'หจก. บุรีรัมย์ปิโตรเลียม',
      vendor_tax_id: '0313548000451',
      vendor_branch: 'สำนักงานใหญ่ (00000)',
      company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
      buyer_tax_id: '0315559001144',
      buyer_branch: 'สำนักงานใหญ่ (00000)',
      subtotal_amount: 13432.71,
      vat_amount: 940.29,
      total_amount: 14373,
      is_valid_tax_invoice: true,
    },
    layout_signature: 'aHash:32x32:e7f8c9b2d1045a8f',
    status: 'active',
    source: 'line_auto',
    created_at: '2026-09-18 16:35:00',
    store_name: 'หจก. บุรีรัมย์ปิโตรเลียม',
    date: '2026-09-18',
    doc_no: 'PTT-BR-8921',
    total_amount: 14373,
    tax_compliance_check: {
      has_mandatory_title: true,
      has_seller_tax_id: true,
      has_buyer_tax_id: true,
      has_vat_breakdown: true,
      is_compliant: true,
    },
  },
  {
    id: 'sample-002',
    doc_type: 'ใบชั่งน้ำหนัก / บัตรชั่ง',
    predicted_doc_type: 'ใบชั่งน้ำหนัก / บัตรชั่ง',
    drive_file_id: '2bC3dE4fG5hI6jK7lM8nO9pQ',
    ground_truth: {
      doc_type: 'ใบชั่งน้ำหนัก / บัตรชั่ง',
      doc_no: 'WT-2609-089',
      date: '2026-09-15',
      store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
      vehicle_registration: '82-5541 บุรีรัมย์',
      scale_weight_in: 32.45,
      scale_weight_out: 12.15,
      scale_weight_net: 20.30,
      total_amount: 7714,
    },
    layout_signature: 'aHash:32x32:b4d2a1f9e8c70123',
    status: 'active',
    source: 'line_auto',
    created_at: '2026-09-15 13:30:00',
    store_name: 'โรงโม่หินศิลาศุภกิจ บุรีรัมย์',
    date: '2026-09-15',
    doc_no: 'WT-2609-089',
    total_amount: 7714,
    tax_compliance_check: {
      has_mandatory_title: true,
      has_seller_tax_id: false, // Non-tax engineering ticket
      has_buyer_tax_id: false,
      has_vat_breakdown: false,
      is_compliant: true,
    },
  },
  {
    id: 'sample-003',
    doc_type: 'ใบส่งของ / ใบกำกับภาษี',
    predicted_doc_type: 'ใบส่งของ / ใบกำกับภาษี',
    drive_file_id: '3cD4eF5gH6iJ7kL8mN9oP0qR',
    ground_truth: {
      doc_type: 'ใบส่งของ / ใบกำกับภาษี',
      tax_invoice_no: 'INV-88910',
      doc_no: 'DO-88910',
      date: '2026-09-15',
      store_name: 'บริษัท ซีแพค บุรีรัมย์ คอนกรีต จำกัด',
      vendor_tax_id: '0315538000881',
      vendor_branch: 'สำนักงานใหญ่ (00000)',
      company_name: 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด',
      buyer_tax_id: '0315559001144',
      buyer_branch: 'สำนักงานใหญ่ (00000)',
      subtotal_amount: 52000,
      vat_amount: 3640,
      total_amount: 55640,
      po_number: 'PO-6902-001',
      vehicle_registration: '70-9821 บุรีรัมย์ (รถโม่)',
      is_valid_tax_invoice: true,
    },
    layout_signature: 'aHash:32x32:c8e1a3b5f7024689',
    status: 'active',
    source: 'user',
    created_at: '2026-09-15 11:20:00',
    store_name: 'บริษัท ซีแพค บุรีรัมย์ คอนกรีต จำกัด',
    date: '2026-09-15',
    doc_no: 'INV-88910',
    total_amount: 55640,
    tax_compliance_check: {
      has_mandatory_title: true,
      has_seller_tax_id: true,
      has_buyer_tax_id: true,
      has_vat_breakdown: true,
      is_compliant: true,
    },
  },
];
