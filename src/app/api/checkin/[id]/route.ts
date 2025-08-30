import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { checkIn } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (_request: Request, ctx: RouteContext) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  const data = await db.query.checkIn.findFirst({
    where: and(eq(checkIn.id, id), eq(checkIn.userId, session.user.id)),
  });

  if (!data) {
    return new Response(
      JSON.stringify({ success: false, message: "Checkin not found" }),
      { status: 404 }
    );
  }

  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
  });
};

export const PUT = async (request: Request, ctx: RouteContext) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }
  const body = await request.json();

  const { id } = await ctx.params;

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, message: "Missing checkInId" }),
      { status: 400 }
    );
  }

  const data = await db
    .update(checkIn)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(checkIn.id, id), eq(checkIn.userId, session.user.id)))
    .returning();

  return new Response(
    JSON.stringify({
      success: true,
      data: data[0],
      message: "Check-in updated successfully",
    }),
    { status: 200 }
  );
};
