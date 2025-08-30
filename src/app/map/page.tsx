import { QueryClient } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AddLocationButton } from "@/components/buttons/add-location-button";
import { CourtCard } from "@/components/cards/court-card";
import { MyMap } from "@/components/map";
import { MapProvider } from "@/components/map-provider";
import { auth } from "@/lib/auth/auth";
import { COURTS_QUERY_KEY } from "@/lib/constants";
import { getCourts } from "@/lib/db/queries";

export default async function Page() {
  const queryClient = new QueryClient();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  await queryClient.prefetchQuery({
    queryKey: [COURTS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getCourts();
      return data;
    },
  });

  return (
    <MapProvider>
      <MyMap />
      <AddLocationButton />
      <CourtCard />
    </MapProvider>
  );
}
