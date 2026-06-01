import type { AppProps } from "next/app";
import MainLayout from "@/shared/layouts/mainLayout/MainLayout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}