import { QueryClient } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { CHECKIN_QUERY_KEY } from "@/lib/constants";
import { getCheckIn } from "@/lib/db/queries";
import { PageClient } from "./page.client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [CHECKIN_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await getCheckIn(id);
      return data;
    },
  });

  return <PageClient id={id} />;
}
