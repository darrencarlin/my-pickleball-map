import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { court } from "@/lib/db/schema";

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

  const data = await db.query.court.findFirst({
    where: and(eq(court.id, id), eq(court.userId, session.user.id)),
    with: {
      checkIns: true,
    },
  });

  if (!data) {
    return new Response(
      JSON.stringify({ success: false, message: "Court not found" }),
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
    .where(and(eq(court.id, id), eq(court.userId, session.user.id)))
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
