"use client";

import { signOut, useSession } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";
import { SignInButton } from "./sign-in-button";

export const SignOutButton = () => {
  const { data: session } = useSession();
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (!session) return <SignInButton />;

  return <Button onClick={handleSignOut}>Sign Out</Button>;
};
