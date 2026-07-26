import type { AppProps } from "next/app";
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
    const isMyGroup = currentPath === "/teams";

    const showLogo = !["/teams", "/teams/new"].includes(currentPath); 
    const centerAlignPaths = ["/auth/signin", "/auth/findId", "/auth/findPw"];
    const mobileAlign = centerAlignPaths.includes(currentPath) ? "center" : "flex-start";
    
    const useAuthLayout = isAuthPage || isMyGroup || isNewTeamPage;
    
    return (
        <>
            {useAuthLayout ? (
                <AuthLayout showLogo={showLogo} mobileAlign={mobileAlign}>
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