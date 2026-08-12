import type { AppProps } from "next/app";
import "@/styles/style.css";
import "@/shared/layouts/components/header/Header.css";
import "@/shared/layouts/components/sidebar/Sidebar.css";
import "@/shared/layouts/components/bottomNav/BottomNav.css";
import "@/shared/layouts/mainLayout/MainLayout.css";
import "@/shared/layouts/authLayout/AuthLayout.css";
import MainLayout from "@/shared/layouts/mainLayout/MainLayout";
import AuthLayout from "@/shared/layouts/authLayout/AuthLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/queryClient";



export default function App({ Component, pageProps, router }: AppProps) {
    const currentPath = router.pathname;

    const isAuthPage = currentPath.startsWith("/auth");
    const isNewTeamPage = currentPath.startsWith("/teams/new");
    const isMyGroup = currentPath === "/teams";

    const showLogo = !["/teams", "/teams/new", "/teams/new/setup"].includes(currentPath); 
    const centerAlignPaths = ["/auth/signin", "/auth/findId", "/auth/findPw"];
    const mobileAlign = centerAlignPaths.includes(currentPath) ? "center" : "flex-start";
    
    const useAuthLayout = isAuthPage || isMyGroup || isNewTeamPage;

    
    return (
        <QueryClientProvider client={queryClient}>
            {useAuthLayout ? (
                <AuthLayout showLogo={showLogo} mobileAlign={mobileAlign}>
                    <Component {...pageProps} />
                </AuthLayout>
            ) : (
                <MainLayout>
                    <Component {...pageProps} />
                </MainLayout>
            )}
        </QueryClientProvider>
    );
}