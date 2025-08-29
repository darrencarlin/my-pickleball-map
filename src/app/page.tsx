import Link from "next/link";
import { SignOutButton } from "@/components/buttons/sign-out-button";

export default async function Home() {
  return (
    <main className="p-4">
      <Link href="/map" className="block underline mb-4">
        Go To Map
      </Link>

      <SignOutButton />
    </main>
  );
}
