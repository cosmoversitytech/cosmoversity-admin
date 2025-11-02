"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function ClientRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      // If user is logged in and on login page, redirect to programs
      if (
        session?.user?.user_metadata?.role === "admin" &&
        pathname === "/login"
      ) {
        router.push("/programs");
      }
      // If user is not logged in and not on login page, redirect to login
      else if (!session && pathname !== "/login") {
        router.push("/login");
      }

      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // Handle auth state changes
      if (
        session?.user?.user_metadata?.role === "admin" &&
        pathname === "/login"
      ) {
        router.push("/programs");
      } else if (!session && pathname !== "/login") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {session ? <Sidebar /> : null}
      <main className="flex-1">{children}</main>
    </div>
  );
}
