import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="p-4">
      <div>{session?.user.id}</div>
      <div>{session?.user.email}</div>
      <Link href="/map" className="underline">
        Go To Map
      </Link>
    </main>
  );
}
