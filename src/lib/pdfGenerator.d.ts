import { Candidate, Template, CompanySettings } from '@/store/useStore';
export declare const generateOfferContent: (candidate: Candidate, template: Template, companySettings: CompanySettings) => string;
export declare const generateOfferPDF: (candidate: Candidate, template: Template, companySettings: CompanySettings) => Promise<void>;
