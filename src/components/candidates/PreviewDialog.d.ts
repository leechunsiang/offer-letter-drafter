import { Candidate, Template, CompanySettings } from "@/store/useStore";
interface PreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: Candidate | null;
    template: Template | null;
    companySettings: CompanySettings;
    onGenerate: () => void;
}
export declare function PreviewDialog({ open, onOpenChange, candidate, template, companySettings, onGenerate, }: PreviewDialogProps): import("react/jsx-runtime").JSX.Element | null;
export {};
