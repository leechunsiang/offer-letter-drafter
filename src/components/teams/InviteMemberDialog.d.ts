interface InviteMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (email: string, role: 'admin' | 'member') => Promise<void>;
}
export declare function InviteMemberDialog({ open, onOpenChange, onInvite }: InviteMemberDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
