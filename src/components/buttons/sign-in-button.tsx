"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";

export const SignInButton = () => {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <Button asChild>
      <Link href="/auth/sign-in">Sign In</Link>
    </Button>
  );
};
