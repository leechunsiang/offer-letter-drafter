export interface Candidate {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Pending' | 'Generated';
    offerDate: string;
}
export interface Template {
    id: string;
    name: string;
    content: string;
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
    loadCandidates: () => Promise<void>;
    loadTemplates: () => Promise<void>;
    loadCompanySettings: () => Promise<void>;
    addCandidate: (candidate: Omit<Candidate, 'id' | 'status'>) => Promise<void>;
    updateCandidateStatus: (id: string, status: 'Pending' | 'Generated') => Promise<void>;
    addTemplate: (template: Omit<Template, 'id'>) => Promise<void>;
    updateTemplate: (id: string, content: string) => Promise<void>;
    updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
}
export declare const useStore: import("zustand").UseBoundStore<import("zustand").StoreApi<Store>>;
export {};
