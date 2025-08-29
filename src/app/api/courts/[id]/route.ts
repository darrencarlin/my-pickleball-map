import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { court } from "@/lib/db/schema";

export const PUT = async (
  request: Request,
  ctx: RouteContext<"/api/courts/[id]">
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  const body = await request.json();

  const { id } = await ctx.params;

  const data = await db
    .update(court)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(court.id, id))
    .returning();

  return new Response(
    JSON.stringify({
      success: true,
      data: data[0],
      message: "Court updated successfully",
    }),
    {
      status: 200,
    }
  );
};
