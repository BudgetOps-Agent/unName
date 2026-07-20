import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/style.css";
import "@/shared/layouts/components/header/Header.css";
import "@/shared/layouts/components/sidebar/Sidebar.css";
import "@/shared/layouts/mainLayout/MainLayout.css";
import "@/shared/layouts/authLayout/AuthLayout.css";
import MainLayout from "@/shared/layouts/mainLayout/MainLayout";
import AuthLayout from "@/shared/layouts/authLayout/AuthLayout";

export default function App({ Component, pageProps, router }: AppProps) {
    const currentPath = router.pathname;

    const isAuthPage = currentPath.startsWith("/auth");
    const isNewTeamPage = currentPath.startsWith("/teams/new");
    const isMyPage = currentPath.startsWith("/teams/[teamId]/mypage");
    const isMyGroup = currentPath === "/teams";

    const showLogo = !["/teams", "/teams/new", "/teams/[teamId]/mypage"].includes(currentPath);
    
    const useAuthLayout = isAuthPage || isMyGroup || isNewTeamPage || isMyPage;
    
    return (
        <>
            {useAuthLayout ? (
                <AuthLayout showLogo={showLogo}>
                    <Component {...pageProps} />
                </AuthLayout>
            ) : (
                <MainLayout>
                    <Component {...pageProps} />
                </MainLayout>
            )}
        </>
    );
}