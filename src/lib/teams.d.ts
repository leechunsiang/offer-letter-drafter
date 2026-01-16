export interface Team {
    id: string;
    name: string;
    owner_id: string;
    invite_code: string;
    created_at: string;
    updated_at: string;
}
export interface TeamWithRole extends Team {
    role: 'owner' | 'admin' | 'user';
}
export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'user';
    joined_at: string;
    user_email?: string;
}
export interface TeamInvitation {
    id: string;
    team_id: string;
    team_name?: string;
    inviter_id: string;
    invitee_email: string;
    invitee_id: string | null;
    role: 'admin' | 'user';
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    expires_at: string;
}
export declare const teamsService: {
    getMyTeams(): Promise<TeamWithRole[]>;
    create(name: string): Promise<Team>;
    update(id: string, name: string): Promise<Team>;
    delete(id: string): Promise<void>;
    getMembers(teamId: string): Promise<TeamMember[]>;
    removeMember(teamId: string, userId: string): Promise<void>;
    updateMemberRole(teamId: string, userId: string, role: "owner" | "admin" | "user"): Promise<void>;
    getMyRole(teamId: string): Promise<"owner" | "admin" | "user" | null>;
    inviteUserByEmail(teamId: string, email: string, role: "admin" | "user"): Promise<TeamInvitation>;
    joinTeamByCode(inviteCode: string): Promise<Team>;
    regenerateInviteCode(teamId: string): Promise<string>;
    getPendingInvitations(): Promise<TeamInvitation[]>;
    getInvitationCount(): Promise<number>;
    acceptInvitation(invitationId: string): Promise<void>;
    rejectInvitation(invitationId: string): Promise<void>;
    getPendingInvitationsForTeam(teamId: string): Promise<TeamInvitation[]>;
    revokeInvitation(invitationId: string): Promise<void>;
};
