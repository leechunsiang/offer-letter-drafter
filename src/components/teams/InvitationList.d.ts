import { TeamInvitation } from '@/lib/teams';
interface InvitationListProps {
    invitations: TeamInvitation[];
    onRevoke: (invitationId: string) => Promise<void>;
}
export declare function InvitationList({ invitations, onRevoke }: InvitationListProps): import("react/jsx-runtime").JSX.Element;
export {};
