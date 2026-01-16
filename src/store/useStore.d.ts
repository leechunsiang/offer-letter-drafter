export interface Candidate {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Pending' | 'Generated' | 'Submitted' | 'Approved' | 'Rejected';
    offerDate: string;
    customContent?: string;
    feedback?: string;
}
export interface Template {
    id: string;
    name: string;
    content: string;
    isDefault: boolean;
}
export interface CompanySettings {
    info: {
        name: string;
        address: string;
        website: string;
        phone: string;
    };
    branding: {
        logoUrl: string;
        primaryColor: string;
    };
    emailConfig: {
        senderName: string;
        senderEmail: string;
    };
}
interface Store {
    candidates: Candidate[];
    templates: Template[];
    companySettings: CompanySettings;
    isLoading: boolean;
    error: string | null;
    initialized: boolean;
    initialize: () => Promise<void>;
    loadCandidates: (teamId?: string) => Promise<void>;
    loadTemplates: (teamId?: string) => Promise<void>;
    loadCompanySettings: (teamId?: string) => Promise<void>;
    addCandidate: (candidate: Omit<Candidate, 'id' | 'status'>, teamId: string) => Promise<void>;
    updateCandidateStatus: (id: string, status: Candidate['status'], feedback?: string) => Promise<void>;
    updateCandidateContent: (id: string, content: string) => Promise<void>;
    addTemplate: (template: Omit<Template, 'id'>, teamId: string) => Promise<void>;
    updateTemplate: (id: string, updates: Partial<Template>, teamId?: string) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    deleteCandidate: (id: string) => Promise<void>;
    updateCompanySettings: (settings: Partial<CompanySettings>, teamId: string) => Promise<void>;
}
export declare const useStore: import("zustand").UseBoundStore<import("zustand").StoreApi<Store>>;
export {};
