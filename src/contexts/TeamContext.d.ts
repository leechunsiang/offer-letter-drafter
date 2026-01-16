import { ReactNode } from 'react';
import { TeamWithRole } from '@/lib/teams';
interface TeamContextType {
    currentTeam: TeamWithRole | null;
    teams: TeamWithRole[];
    loading: boolean;
    selectTeam: (teamId: string) => void;
    refreshTeams: () => Promise<void>;
    getCurrentRole: () => 'owner' | 'admin' | 'user' | null;
}
export declare function TeamProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useTeam(): TeamContextType;
export {};
