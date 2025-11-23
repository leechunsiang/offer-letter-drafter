import React from 'react';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}
interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}
export declare function useToast(): ToastContextType;
export declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
