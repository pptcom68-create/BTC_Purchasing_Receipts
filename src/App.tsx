import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActivePage } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DocumentTable } from './components/DocumentTable';
import { SupplierAnalyticsView } from './components/SupplierAnalyticsView';
import { MaterialPriceTrackerView } from './components/MaterialPriceTrackerView';
import { VendorBillingView } from './components/VendorBillingView';
import { AITemplateManagerView } from './components/AITemplateManagerView';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { DocumentEditModal } from './components/DocumentEditModal';
import { CreateDocumentModal } from './components/CreateDocumentModal';
import { CompanyModal } from './components/CompanyModal';
import { SettingsModal } from './components/SettingsModal';
import { StorageService } from './lib/storage';
import { generateStatutoryPrompt } from './services/aiOcrService';
import {
  PurchasingDocument,
  DocumentLink,
  VendorBillingNote,
  AIPromptSet,
  AISample,
  AppConfig,
} from './types';
import { normalizeMatchKey } from './utils/formatters';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<PurchasingDocument[]>([]);
  const [links, setLinks] = useState<DocumentLink[]>([]);
  const [vendorBillings, setVendorBillings] = useState<VendorBillingNote[]>([]);
  const [prompts, setPrompts] = useState<AIPromptSet[]>([]);
  const [samples, setSamples] = useState<AISample[]>([]);
  const [customDocTypes, setCustomDocTypes] = useState<string[]>([]);
  const [config, setConfig] = useState<AppConfig>(StorageService.getConfig());

  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [docTab, setDocTab] = useState<'all' | 'po' | 'matched'>('all');

  // Modal States
  const [selectedDoc, setSelectedDoc] = useState<PurchasingDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<PurchasingDocument | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Initial Load from Storage
  useEffect(() => {
    setDocuments(StorageService.getDocuments());
    setLinks(StorageService.getLinks());
    setVendorBillings(StorageService.getVendorBillings());
    setPrompts(StorageService.getPrompts());
    setSamples(StorageService.getSamples());
    setCustomDocTypes(StorageService.getCustomDocTypes());
    setConfig(StorageService.getConfig());
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDocuments(StorageService.getDocuments());
      setLinks(StorageService.getLinks());
      setVendorBillings(StorageService.getVendorBillings());
      setIsRefreshing(false);
      showToast('อัปเดตข้อมูลและตรวจสอบความสอดคล้องเรียบร้อยแล้ว');
    }, 600);
  };

  // CRUD Handlers
  const handleSaveNewDoc = (newDoc: PurchasingDocument) => {
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    StorageService.saveDocuments(updated);
    showToast(`บันทึก ${newDoc.doc_type} เลขที่ ${newDoc.doc_no || newDoc.po_number} เข้าระบบเรียบร้อยแล้ว`);
  };

  const handleSaveEditDoc = (updatedDoc: PurchasingDocument) => {
    const updated = documents.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
    setDocuments(updated);
    StorageService.saveDocuments(updated);
    setEditingDoc(null);
    if (selectedDoc && selectedDoc.id === updatedDoc.id) {
      setSelectedDoc(updatedDoc);
    }
    showToast('บันทึกการแก้ไขข้อมูลบิลเรียบร้อยแล้ว');
  };

  const handleDeleteDoc = (docToDelete: PurchasingDocument) => {
    if (
      !window.confirm(
        `ยืนยันการลบเอกสาร?\n\nเลขที่: ${docToDelete.doc_no || docToDelete.po_number}\nร้านค้า: ${docToDelete.store_name}\nยอดเงิน: ฿${docToDelete.total_amount.toLocaleString()}`
      )
    ) {
      return;
    }

    const updatedDocs = documents.filter((d) => d.id !== docToDelete.id);
    const updatedLinks = links.filter(
      (l) => l.po_doc_key !== docToDelete.doc_key && l.link_doc_key !== docToDelete.doc_key
    );

    setDocuments(updatedDocs);
    setLinks(updatedLinks);
    StorageService.saveDocuments(updatedDocs);
    StorageService.saveLinks(updatedLinks);

    if (selectedDoc && selectedDoc.id === docToDelete.id) {
      setSelectedDoc(null);
    }

    showToast('ลบเอกสารออกจากระบบและฐานข้อมูลเรียบร้อยแล้ว');
  };

  // Linking Handlers
  const handleLinkDocument = (poDocKey: string, linkDocKey: string) => {
    const po = documents.find((d) => d.doc_key === poDocKey);
    const linked = documents.find((d) => d.doc_key === linkDocKey);
    if (!po || !linked) return;

    const newLink: DocumentLink = {
      id: Date.now(),
      po_doc_key: poDocKey,
      po_label: `${po.doc_type} ${po.po_number}`,
      po_store_name: po.store_name,
      link_doc_key: linkDocKey,
      link_label: `${linked.doc_type} ${linked.doc_no || linked.doc_key}`,
      link_store_name: linked.store_name,
      link_type: linked.doc_type,
      link_scale_net: linked.scale_weight_net,
      link_vehicle: linked.vehicle_registration,
      status: 'pending',
      match_type: 'MANUAL',
      confidence_score: 1.0,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    StorageService.saveLinks(updatedLinks);
    showToast(`จับคู่ ${linked.doc_type} เข้ากับ PO เรียบร้อย (สถานะ: รอตรวจสอบ)`);
  };

  const handleUnlinkDocument = (poDocKey: string, linkDocKey: string) => {
    const updatedLinks = links.filter(
      (l) => !(l.po_doc_key === poDocKey && l.link_doc_key === linkDocKey)
    );
    setLinks(updatedLinks);
    StorageService.saveLinks(updatedLinks);
    showToast('ยกเลิกการจับคู่เอกสารเรียบร้อยแล้ว');
  };

  const handleConfirmLink = (targetLink: DocumentLink) => {
    const updatedLinks = links.map((l) => {
      if (l.po_doc_key === targetLink.po_doc_key && l.link_doc_key === targetLink.link_doc_key) {
        return {
          ...l,
          status: 'confirmed' as const,
          confirmed_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
      }
      return l;
    });

    setLinks(updatedLinks);
    StorageService.saveLinks(updatedLinks);
    showToast('ยืนยันการจับคู่เอกสารเรียบร้อยแล้ว (สถานะ: จับคู่แล้ว)');
  };

  // Background Auto-matcher simulation based on attached rules
  const handleAutoMatch = () => {
    const poList = documents.filter((d) => d.doc_type === 'ใบสั่งซื้อ');
    const billList = documents.filter((d) => d.doc_type !== 'ใบสั่งซื้อ');

    let newCount = 0;
    const currentLinks = [...links];

    billList.forEach((bill) => {
      // Check if bill already linked
      if (currentLinks.some((l) => l.link_doc_key === bill.doc_key)) return;

      // Rule 1: Exact PO Match in po_number or ref_no
      const exactPo = poList.find(
        (po) =>
          normalizeMatchKey(po.po_number) === normalizeMatchKey(bill.po_number) ||
          (bill.ref_no && normalizeMatchKey(po.po_number) === normalizeMatchKey(bill.ref_no)) ||
          (bill.ref_no && normalizeMatchKey(po.doc_no) === normalizeMatchKey(bill.ref_no))
      );

      if (exactPo) {
        currentLinks.push({
          id: Date.now() + Math.random(),
          po_doc_key: exactPo.doc_key,
          po_label: `${exactPo.doc_type} ${exactPo.po_number}`,
          po_store_name: exactPo.store_name,
          link_doc_key: bill.doc_key,
          link_label: `${bill.doc_type} ${bill.doc_no || bill.doc_key}`,
          link_store_name: bill.store_name,
          link_type: bill.doc_type,
          link_scale_net: bill.scale_weight_net,
          link_vehicle: bill.vehicle_registration,
          status: 'pending',
          match_type: 'AUTO_EXACT',
          confidence_score: 0.98,
          remark_text: 'ระบบจับคู่ด้วยรหัส PO ที่ตรงกันอัตโนมัติ',
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
        newCount++;
        return;
      }

      // Rule 2: Soft store name and date/amount match
      const softPo = poList.find(
        (po) =>
          normalizeMatchKey(po.store_name) === normalizeMatchKey(bill.store_name) &&
          (po.date === bill.date || Math.abs((po.total_amount || 0) - (bill.total_amount || 0)) < 1)
      );

      if (softPo) {
        currentLinks.push({
          id: Date.now() + Math.random(),
          po_doc_key: softPo.doc_key,
          po_label: `${softPo.doc_type} ${softPo.po_number}`,
          po_store_name: softPo.store_name,
          link_doc_key: bill.doc_key,
          link_label: `${bill.doc_type} ${bill.doc_no || bill.doc_key}`,
          link_store_name: bill.store_name,
          link_type: bill.doc_type,
          link_scale_net: bill.scale_weight_net,
          link_vehicle: bill.vehicle_registration,
          status: 'pending',
          match_type: 'AUTO_SUGGESTED',
          confidence_score: 0.85,
          remark_text: 'ระบบแนะนำ: ร้านค้าและยอดเงินตรงกัน',
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
        newCount++;
      }
    });

    if (newCount > 0) {
      setLinks(currentLinks);
      StorageService.saveLinks(currentLinks);
      showToast(`ค้นพบและแนะนำการจับคู่อัตโนมัติใหม่ ${newCount} รายการ! กรุณาตรวจสอบและยืนยัน`);
    } else {
      showToast('ไม่พบคู่เอกสารใหม่ที่ตรงกับเงื่อนไขการจับคู่อัตโนมัติ', 'info');
    }
  };

  // Reanalyze with AI
  const handleReanalyze = (doc: PurchasingDocument) => {
    setIsReanalyzing(true);
    setTimeout(() => {
      setIsReanalyzing(false);
      showToast(`AI สแกนและตรวจสอบข้อมูลสำหรับ ${doc.doc_no || doc.po_number} เรียบร้อยแล้ว`);
    }, 1200);
  };

  // Vendor Billing Handlers
  const handleCreateBillingNote = (
    noteData: Omit<VendorBillingNote, 'id' | 'created_at'>
  ) => {
    const newNote: VendorBillingNote = {
      ...noteData,
      id: `vn-${Date.now()}`,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    const updated = [newNote, ...vendorBillings];
    setVendorBillings(updated);
    StorageService.saveVendorBillings(updated);
    showToast(`สร้างใบวางบิลเลขที่ ${newNote.billing_no} เรียบร้อยแล้ว`);
  };

  const handleUpdateBillingStatus = (
    id: string,
    status: 'validated' | 'paid' | 'rejected'
  ) => {
    const updated = vendorBillings.map((b) => (b.id === id ? { ...b, status } : b));
    setVendorBillings(updated);
    StorageService.saveVendorBillings(updated);
    showToast(`อัปเดตสถานะใบวางบิลเป็น "${status === 'paid' ? 'อนุมัติจ่ายแล้ว' : status}" เรียบร้อยแล้ว`);
  };

  // AI Prompt and Review Handlers
  const handleGeneratePrompt = (docType: string) => {
    showToast(`AI กำลังประมวลผลและเขียนชุดคำสั่งตามเกณฑ์ประมวลรัษฎากรสำหรับ "${docType}"...`);
    setTimeout(() => {
      const updated = prompts.map((p) => {
        if (p.doc_type === docType) {
          const generatedPrompt = generateStatutoryPrompt(docType, p.field_config);
          return {
            ...p,
            version: p.version + 1,
            status: 'ready' as const,
            prompt_text: generatedPrompt,
          };
        }
        return p;
      });
      setPrompts(updated);
      StorageService.savePrompts(updated);
      showToast(`AI ปรับปรุงชุดคำสั่งตามมาตรฐานภาษีสำหรับ "${docType}" เรียบร้อยแล้ว!`);
    }, 800);
  };

  const handleUpdateFieldConfig = (docType: string, field: string, enabled: boolean) => {
    const updated = prompts.map((p) => {
      if (p.doc_type === docType) {
        const nextFieldConfig = { ...p.field_config, [field]: enabled };
        const autoRegenerated = generateStatutoryPrompt(docType, nextFieldConfig);
        return {
          ...p,
          field_config: nextFieldConfig,
          prompt_text: autoRegenerated,
        };
      }
      return p;
    });
    setPrompts(updated);
    StorageService.savePrompts(updated);
  };

  const handleSaveSampleReview = (sampleId: string, docType: string, groundTruth: any) => {
    const updated = samples.map((s) => {
      if (s.id === sampleId) {
        return {
          ...s,
          doc_type: docType,
          status: 'active' as const,
          ground_truth: groundTruth,
        };
      }
      return s;
    });
    setSamples(updated);
    StorageService.saveSamples(updated);
    showToast('บันทึก Ground Truth เข้าสู่ระบบการเรียนรู้ของ AI เรียบร้อยแล้ว');
  };

  const handleCreatePromptSet = (title: string, docType: string) => {
    const initialFieldConfig = {
      doc_type: true,
      doc_no: true,
      date: true,
      store_name: true,
      total_amount: true,
      items: true,
    };
    const newSet: AIPromptSet = {
      id: `prompt-${Date.now()}`,
      title,
      doc_type: docType,
      kind: 'custom',
      status: 'ready',
      prompt_text: generateStatutoryPrompt(docType, initialFieldConfig),
      base_knowledge: `ประเภทเอกสารเฉพาะขององค์กร: ${title}`,
      field_config: initialFieldConfig,
      sample_count: 0,
      version: 1,
    };
    const existingIndex = prompts.findIndex((p) => p.doc_type === docType || p.id === newSet.id);
    let updated: AIPromptSet[];
    if (existingIndex >= 0) {
      updated = prompts.map((p, idx) => (idx === existingIndex ? newSet : p));
    } else {
      updated = [...prompts, newSet];
    }
    setPrompts(updated);
    StorageService.savePrompts(updated);
    showToast(`เพิ่มชุดคำสั่งใหม่สำหรับ "${title}" เรียบร้อยแล้ว`);
  };

  const handleAddCustomDocType = (name: string) => {
    if (!customDocTypes.includes(name)) {
      const updated = [...customDocTypes, name];
      setCustomDocTypes(updated);
      StorageService.saveCustomDocTypes(updated);
      showToast(`เพิ่มประเภทเอกสารองค์กร "${name}" เรียบร้อยแล้ว`);
    }
  };

  const handleSaveConfig = (newCfg: AppConfig) => {
    setConfig(newCfg);
    StorageService.saveConfig(newCfg);
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  const pendingReviewCount = documents.filter((d) => d.needs_review).length;
  const unmatchedCount = links.filter((l) => l.status === 'pending').length;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 text-slate-800 antialiased overflow-hidden select-none">
      {/* Top Header */}
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenCompany={() => setIsCompanyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main App Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={(p) => setActivePage(p)}
          onOpenCompany={() => setIsCompanyOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          pendingReviewCount={pendingReviewCount}
          unmatchedCount={unmatchedCount}
        />

        {/* Main View Display */}
        <main className="flex-1 flex flex-col min-h-0 p-3 sm:p-5 overflow-auto custom-scrollbar">
          {activePage === 'overview' && (
            <OverviewDashboard
              documents={documents}
              links={links}
              onNavigateToTab={(tab) => {
                setDocTab(tab);
                setActivePage('documents');
              }}
              onSelectDocument={(d) => setSelectedDoc(d)}
            />
          )}

          {activePage === 'documents' && (
            <DocumentTable
              documents={documents}
              links={links}
              activeTab={docTab}
              onTabChange={(t) => setDocTab(t)}
              onSelectDocument={(d) => setSelectedDoc(d)}
              onEditDocument={(d) => setEditingDoc(d)}
              onDeleteDocument={handleDeleteDoc}
              onConfirmLink={handleConfirmLink}
              onRemoveLink={(l) => handleUnlinkDocument(l.po_doc_key, l.link_doc_key)}
              onAutoMatch={handleAutoMatch}
              customDocTypes={customDocTypes}
            />
          )}

          {activePage === 'suppliers' && (
            <SupplierAnalyticsView documents={documents} />
          )}

          {activePage === 'prices' && (
            <MaterialPriceTrackerView documents={documents} />
          )}

          {activePage === 'billing' && (
            <VendorBillingView
              billingNotes={vendorBillings}
              documents={documents}
              links={links}
              onCreateBillingNote={handleCreateBillingNote}
              onUpdateStatus={handleUpdateBillingStatus}
            />
          )}

          {activePage === 'ai-prompts' && (
            <AITemplateManagerView
              prompts={prompts}
              samples={samples}
              onGeneratePrompt={handleGeneratePrompt}
              onUpdateFieldConfig={handleUpdateFieldConfig}
              onSaveSampleReview={handleSaveSampleReview}
              onCreatePromptSet={handleCreatePromptSet}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs flex items-center space-x-2.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : toast.type === 'info'
              ? 'bg-sky-50 text-sky-900 border-sky-300'
              : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          {toast.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#27AE60] shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <DocumentDetailModal
        document={selectedDoc}
        allDocuments={documents}
        links={links}
        onClose={() => setSelectedDoc(null)}
        onOpenEdit={(d) => {
          setSelectedDoc(null);
          setEditingDoc(d);
        }}
        onReanalyze={handleReanalyze}
        isReanalyzing={isReanalyzing}
        onLinkDocument={handleLinkDocument}
        onUnlinkDocument={handleUnlinkDocument}
        onConfirmLink={handleConfirmLink}
      />

      <DocumentEditModal
        document={editingDoc}
        onClose={() => setEditingDoc(null)}
        onSave={handleSaveEditDoc}
        customDocTypes={customDocTypes}
        onAddCustomDocType={handleAddCustomDocType}
      />

      <CreateDocumentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveNewDoc}
      />

      <CompanyModal
        isOpen={isCompanyOpen}
        onClose={() => setIsCompanyOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
