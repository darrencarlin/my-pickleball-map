"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { court } from "@/lib/db/schema";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const courts = await db.query.court.findMany({
      where: (court, { eq }) => eq(court.userId, session.user.id),
    });

    return new Response(JSON.stringify({ success: true, data: courts }), {
      status: 200,
    });
  } catch (error) {
    console.error({ error });
    return new Response(
      JSON.stringify({ success: false, message: "Failed to retrieve courts" }),
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
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

  try {
    const data = await db.insert(court).values({
      userId: session.user.id,
      ...body,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: "Court created successfully",
      }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error({ error });
    return new Response(
      JSON.stringify({ success: false, message: "Failed to create court" }),
      { status: 500 }
    );
  }
};
