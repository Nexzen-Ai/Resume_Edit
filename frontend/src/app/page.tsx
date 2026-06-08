"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import Landing from "@/components/Landing";

export default function Home() {
  const router = useRouter();
  const [loggedIn] = useState(() => isLoggedIn());

  useEffect(() => {
    if (loggedIn) router.replace("/dashboard");
  }, [loggedIn, router]);

  if (loggedIn) return null;
  return <Landing />;
}
