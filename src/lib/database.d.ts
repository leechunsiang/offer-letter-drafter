import type { Candidate, Template, CompanySettings } from '@/store/useStore';
export interface DbCandidate {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Pending' | 'Generated';
    offer_date: string;
    created_at: string;
    updated_at: string;
}
export interface DbTemplate {
    id: string;
    name: string;
    content: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}
export interface DbCompanySettings {
    id: string;
    company_name: string;
    company_address: string;
    company_website: string;
    company_phone: string;
    logo_url: string;
    primary_color: string;
    sender_name: string;
    sender_email: string;
    created_at: string;
    updated_at: string;
}
export declare const candidatesService: {
    getAll(): Promise<Candidate[]>;
    create(candidate: Omit<Candidate, "id" | "status">): Promise<Candidate>;
    updateStatus(id: string, status: "Pending" | "Generated"): Promise<Candidate>;
    delete(id: string): Promise<void>;
    subscribe(callback: () => void): () => void;
};
export declare const templatesService: {
    getAll(): Promise<Template[]>;
    create(template: Omit<Template, "id">): Promise<Template>;
    update(id: string, updates: Partial<Template>): Promise<Template>;
    delete(id: string): Promise<void>;
    subscribe(callback: () => void): () => void;
};
export declare const companySettingsService: {
    get(): Promise<CompanySettings | null>;
    upsert(settings: CompanySettings): Promise<CompanySettings>;
    subscribe(callback: () => void): () => void;
};
