import { useEffect } from "react";
import { useRouter } from "next/router";
import { getMe } from "@/features/auth/api/authApi";

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await getMe();
        router.replace("/teams");
      } catch {
        router.replace("/auth/signin");
      }
    };

    checkLogin();
  }, [router]);

  return null;
}