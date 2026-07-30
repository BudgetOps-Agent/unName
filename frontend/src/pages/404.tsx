import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (response.ok) {
          router.replace("/teams");
        } else {
          router.replace("/auth/signin");
        }
      } catch {
        router.replace("/auth/signin");
      }
    };

    checkLogin();
  }, [router]);

  return null;
}