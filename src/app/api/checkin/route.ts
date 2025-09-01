import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { checkIn } from "@/lib/db/schema";

export const GET = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const courtId = searchParams.get("courtId");

  if (!courtId) {
    return new Response(
      JSON.stringify({ success: false, message: "Missing courtId" }),
      { status: 400 }
    );
  }

  const checkIns = await db.query.checkIn.findMany({
    where: (checkIn, { and, eq }) =>
      and(eq(checkIn.courtId, courtId), eq(checkIn.userId, session.user.id)),
  });

  return new Response(JSON.stringify({ success: true, data: checkIns }), {
    status: 200,
  });
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const data = await db.insert(checkIn).values({
      userId: session.user.id,
      ...body,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: "Check-in created successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating check-in:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create check-in",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
