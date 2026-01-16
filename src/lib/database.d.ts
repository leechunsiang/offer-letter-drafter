import type { Candidate, Template, CompanySettings } from '@/store/useStore';
export interface DbCandidate {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Pending' | 'Generated' | 'Submitted' | 'Approved' | 'Rejected';
    offer_date: string;
    custom_content?: string;
    feedback?: string;
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
    getAll(teamId?: string): Promise<Candidate[]>;
    create(candidate: Omit<Candidate, "id" | "status">, teamId?: string): Promise<Candidate>;
    updateStatus(id: string, status: Candidate["status"], feedback?: string): Promise<Candidate>;
    updateContent(id: string, content: string): Promise<Candidate>;
    delete(id: string): Promise<void>;
    subscribe(callback: () => void, teamId?: string): () => void;
};
export declare const templatesService: {
    getAll(teamId?: string): Promise<Template[]>;
    create(template: Omit<Template, "id">, teamId?: string): Promise<Template>;
    update(id: string, updates: Partial<Template>, teamId?: string): Promise<Template>;
    delete(id: string): Promise<void>;
    subscribe(callback: () => void, teamId?: string): () => void;
};
export declare const companySettingsService: {
    get(teamId?: string): Promise<CompanySettings | null>;
    upsert(settings: CompanySettings, teamId?: string): Promise<CompanySettings>;
    subscribe(callback: () => void, teamId?: string): () => void;
};
