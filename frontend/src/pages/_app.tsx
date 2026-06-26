import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
import "@/shared/layouts/components/header/Header.css";
import "@/shared/layouts/components/sidebar/Sidebar.css";
import "@/shared/components/button/Button.css";
import MainLayout from "@/shared/layouts/mainLayout/MainLayout";

export default function App({ Component, pageProps }: AppProps) {
  return (
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
  );
}