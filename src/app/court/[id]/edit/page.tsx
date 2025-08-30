import { PageClient } from "./page.client";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  return <PageClient id={id} />;
}
