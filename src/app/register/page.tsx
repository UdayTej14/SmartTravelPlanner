"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// We use Google Sign-In only — redirect to login
export default function RegisterPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}
