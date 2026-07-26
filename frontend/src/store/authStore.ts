import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResponseSignin } from "@/types/auth"; 
import { logout as logoutApi } from '@/pages/auth/api/authApi';


interface AuthState {
    isLoggedIn: boolean;
    user: ResponseSignin | null;
    login: (userData: ResponseSignin) => void;
    logout: () => Promise<void>;
    clearAuth: () => void;
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
            
            logout: async () => {
              await logoutApi();
            },

            clearAuth: () => set({
              isLoggedIn: false,
              user: null
            }),
        }),
        {
            name: 'auth-storage',
        }
    )
);