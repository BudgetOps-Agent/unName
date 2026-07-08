import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
import "@/styles/components.css";
import "@/shared/layouts/components/header/Header.css";
import "@/shared/layouts/components/sidebar/Sidebar.css";
import "@/shared/layouts/mainLayout/MainLayout.css";
import "@/shared/layouts/authLayout/AuthLayout.css";
import "@/styles/dashboard.css";
import MainLayout from "@/shared/layouts/mainLayout/MainLayout";
import AuthLayout from "@/shared/layouts/authLayout/AuthLayout";

export default function App({ Component, pageProps, router }: AppProps) {
    const isAuthPage = router.pathname.startsWith("/auth");
    const isNewTeamPage = router.pathname.startsWith("/teams/new");
    const isMyPage = router.pathname.startsWith("/teams/[teamId]/mypage");
    const showLogo = !["/teams/new", "/teams/[teamId]/mypage"].includes(router.pathname);
    return (
        <>
            {isAuthPage || isNewTeamPage || isMyPage ? (
                <AuthLayout showLogo={showLogo}>
                    <Component {...pageProps} />
                </AuthLayout>
            ) : (
                <MainLayout>
                    <Head>
                        <link 
                        rel="stylesheet" 
                        as="style" 
                        crossOrigin="anonymous" 
                        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" 
                        />
                    </Head>
                    <Component {...pageProps} />
                </MainLayout>
            )}
        </>
    );
}