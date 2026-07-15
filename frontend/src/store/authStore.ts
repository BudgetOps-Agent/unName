import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResponseSignin } from "@/types/auth";

interface AuthState {
    isLoggedIn: boolean;
    user: ResponseSignin | null;
    login: (userData: ResponseSignin) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            user: null,

            login: (userData) => set({
                isLoggedIn: true,
                user: userData
            }),
            
            logout: () => set({
                isLoggedIn: false,
                user: null
            }),
        }),
        {
            name: 'auth-storage',
        }
    )
);