import { ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{
        error: AuthError | null;
    }>;
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{
        error: AuthError | null;
    }>;
    signOut: () => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
