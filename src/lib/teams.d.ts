export interface Team {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
}
export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
    user_email?: string;
}
export declare const teamsService: {
    getMyTeams(): Promise<Team[]>;
    create(name: string): Promise<Team>;
    update(id: string, name: string): Promise<Team>;
    delete(id: string): Promise<void>;
    getMembers(teamId: string): Promise<TeamMember[]>;
    addMember(_teamId: string, _email: string, _role?: "admin" | "member"): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
    getMyRole(teamId: string): Promise<"owner" | "admin" | "member" | null>;
};
