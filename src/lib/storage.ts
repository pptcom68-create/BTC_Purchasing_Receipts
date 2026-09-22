import { 
  PurchasingDocument, 
  DocumentLink, 
  VendorBillingNote, 
  AIPromptSet, 
  AISample,
  AppConfig 
} from '../types';
import { 
  INITIAL_DOCUMENTS, 
  INITIAL_LINKS, 
  INITIAL_VENDOR_BILLINGS, 
  INITIAL_PROMPT_SETS, 
  INITIAL_SAMPLES 
} from '../data/mockData';

const STORAGE_KEYS = {
  DOCUMENTS: 'btc_purchasing_documents_v1',
  LINKS: 'btc_document_links_v1',
  VENDOR_BILLINGS: 'btc_vendor_billings_v1',
  PROMPTS: 'btc_ai_prompts_v1',
  SAMPLES: 'btc_ai_samples_v1',
  CUSTOM_DOC_TYPES: 'btc_custom_doc_types_v1',
  CONFIG: 'btc_app_config_v1',
};

const LEGACY_DOC_TYPE_MAP: Record<string, string> = {
  'ใบส่งของ': 'ใบส่งของ / ใบส่งสินค้าชั่วคราว',
  'ใบชั่ง': 'ใบชั่งน้ำหนัก / บัตรชั่ง',
  'ใบส่งของ/ใบกำกับภาษี': 'ใบส่งของ / ใบกำกับภาษี',
  'ใบกำกับภาษี': 'ใบกำกับภาษีแบบเต็มรูป',
};

export const StorageService = {
  getDocuments(): PurchasingDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse documents from localStorage', e);
    }
    this.saveDocuments(INITIAL_DOCUMENTS);
    return INITIAL_DOCUMENTS;
  },

  saveDocuments(docs: PurchasingDocument[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.warn('Failed to save documents to localStorage', e);
    }
  },

  getLinks(): DocumentLink[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse links from localStorage', e);
    }
    this.saveLinks(INITIAL_LINKS);
    return INITIAL_LINKS;
  },

  saveLinks(links: DocumentLink[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    } catch (e) {
      console.warn('Failed to save links to localStorage', e);
    }
  },

  getVendorBillings(): VendorBillingNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VENDOR_BILLINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse vendor billings from localStorage', e);
    }
    this.saveVendorBillings(INITIAL_VENDOR_BILLINGS);
    return INITIAL_VENDOR_BILLINGS;
  },

  saveVendorBillings(billings: VendorBillingNote[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.VENDOR_BILLINGS, JSON.stringify(billings));
    } catch (e) {
      console.warn('Failed to save vendor billings to localStorage', e);
    }
  },

  getPrompts(): AIPromptSet[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      if (data) {
        const parsed: AIPromptSet[] = JSON.parse(data);
        // Normalize legacy doc_type names in saved prompt sets
        const normalized = parsed.map((p) => {
          const mappedDocType = LEGACY_DOC_TYPE_MAP[p.doc_type] || p.doc_type;
          return {
            ...p,
            doc_type: mappedDocType,
          };
        });

        // Deduplicate and merge by doc_type and id
        const promptMap = new Map<string, AIPromptSet>();
        // Initialize with default standard prompts
        for (const initPrompt of INITIAL_PROMPT_SETS) {
          promptMap.set(initPrompt.doc_type, initPrompt);
        }

        // Overlay user modifications
        for (const p of normalized) {
          if (!p || !p.doc_type) continue;
          const existing = promptMap.get(p.doc_type);
          if (existing) {
            promptMap.set(p.doc_type, {
              ...existing,
              ...p,
              id: existing.id, // keep canonical id
              doc_type: existing.doc_type,
            });
          } else {
            promptMap.set(p.doc_type, p);
          }
        }

        // Ensure all IDs are strictly unique to prevent duplicate key collisions
        const seenIds = new Set<string>();
        const result: AIPromptSet[] = [];
        for (const item of promptMap.values()) {
          let uniqueId = item.id;
          if (seenIds.has(uniqueId)) {
            uniqueId = `${item.id}-${item.doc_type.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}`;
          }
          seenIds.add(uniqueId);
          result.push({ ...item, id: uniqueId });
        }

        this.savePrompts(result);
        return result;
      }
    } catch (e) {
      console.warn('Failed to parse prompts from localStorage', e);
    }
    this.savePrompts(INITIAL_PROMPT_SETS);
    return INITIAL_PROMPT_SETS;
  },

  savePrompts(prompts: AIPromptSet[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    } catch (e) {
      console.warn('Failed to save prompts to localStorage', e);
    }
  },

  getSamples(): AISample[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAMPLES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse samples from localStorage', e);
    }
    this.saveSamples(INITIAL_SAMPLES);
    return INITIAL_SAMPLES;
  },

  saveSamples(samples: AISample[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(samples));
    } catch (e) {
      console.warn('Failed to save samples to localStorage', e);
    }
  },

  getCustomDocTypes(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DOC_TYPES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse custom doc types', e);
    }
    return [];
  },

  saveCustomDocTypes(types: string[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DOC_TYPES, JSON.stringify(types));
    } catch (e) {
      console.warn('Failed to save custom doc types', e);
    }
  },

  getConfig(): AppConfig {
    const fallback: AppConfig = {
      supabaseUrl: 'https://btc-purchasing.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_client_view',
      gasApiUrl: 'https://script.google.com/macros/s/AKfycbz_BTC_Purchasing_GAS/exec',
      geminiApiKey: '',
      driveFolderName: 'BTC_Purchasing_Receipts',
      spreadsheetId: '1g8phrNtvv6jnMUDVPeWp-IfI-f9VKvfBVkhtmSG6Sj8',
    };
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) return { ...fallback, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Failed to parse config from localStorage', e);
    }
    return fallback;
  },

  saveConfig(config: AppConfig) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save config to localStorage', e);
    }
  },

  resetToDefaults() {
    this.saveDocuments(INITIAL_DOCUMENTS);
    this.saveLinks(INITIAL_LINKS);
    this.saveVendorBillings(INITIAL_VENDOR_BILLINGS);
    this.savePrompts(INITIAL_PROMPT_SETS);
    this.saveSamples(INITIAL_SAMPLES);
  }
};
