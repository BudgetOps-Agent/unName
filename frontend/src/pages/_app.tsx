import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
import "@/shared/layouts/components/header/Header.css";
import "@/shared/layouts/components/sidebar/Sidebar.css";
import "@/shared/layouts/mainLayout/MainLayout.css";
import "@/styles/dashboard.css";
import MainLayout from "@/shared/layouts/mainLayout/MainLayout";
import React from "react";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = 
    Component.getLayout ??
    ((page: ReactElement) => <MainLayout>{page}</MainLayout>)
  
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </Head>

      {getLayout(<Component {...pageProps} />)}
    </>
  );
}