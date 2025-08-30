import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { CLOUDFLARE_BUCKET } from "@/lib/constants";
import { db } from "@/lib/db";
import { image } from "@/lib/db/schema";

// Dynamic import Sharp to handle module loading issues
const getSharp = async () => {
  try {
    const { default: sharp } = await import("sharp");
    return sharp;
  } catch (error) {
    console.error("Failed to load Sharp:", error);
    throw new Error("Image processing unavailable");
  }
};

const CONFIG = {
  MAX_WIDTH: 800,
  MAX_HEIGHT: 800,
  IMAGE_FORMAT: "webp" as const,
  IMAGE_FORMAT_FULL: "image/webp" as const,
  IMAGE_QUALITY: 100,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

const isValidImageType = (file: File): boolean => {
  return (
    file.type.startsWith("image/") &&
    ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
  );
};

if (!process.env.R2_S3_ENDPOINT) {
  throw new Error("R2_S3_ENDPOINT environment variable is not set.");
}

if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error("R2_ACCESS_KEY_ID environment variable is not set.");
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error("R2_SECRET_ACCESS_KEY environment variable is not set.");
}

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const POST = async (request: Request) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const courtId = formData.get("courtId") as string | null;
    const checkinId = formData.get("checkinId") as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please select an image to upload.",
        }),
        { status: 400 }
      );
    }

    if (!isValidImageType(file) || file.size > CONFIG.MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Please upload a valid image file (JPEG, PNG, or WebP) under 10MB.",
        }),
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Get Sharp instance
    const sharp = await getSharp();

    const resizedBuffer = await sharp(Buffer.from(arrayBuffer))
      .rotate()
      .resize({
        width: CONFIG.MAX_WIDTH,
        height: CONFIG.MAX_HEIGHT,
        fit: "inside",
        fastShrinkOnLoad: true,
      })
      .toFormat(CONFIG.IMAGE_FORMAT, { quality: CONFIG.IMAGE_QUALITY })
      .toBuffer();

    const userId = session.user?.id;
    const id = crypto.randomUUID();

    const key = `${userId}/${id}.${CONFIG.IMAGE_FORMAT}`;

    // Upload to R2
    await client.send(
      new PutObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        Key: key,
        Body: resizedBuffer,
        ContentType: CONFIG.IMAGE_FORMAT_FULL,
      })
    );

    // Store the image in the database with optional court/checkin association
    await db.insert(image).values({
      imageId: id,
      userId,
      courtId: courtId || null,
      checkinId: checkinId || null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Image uploaded successfully!",
        data: { id, url: `${process.env.R2_PUBLIC_URL}/${key}` },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Image upload error details:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message:
          "We're having trouble uploading your image right now. Please try again.",
      }),
      { status: 500 }
    );
  }
};

export const GET = async (request: Request) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const courtId = url.searchParams.get("courtId");
    const checkinId = url.searchParams.get("checkinId");

    if (!courtId && !checkinId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Either courtId or checkinId is required",
        }),
        { status: 400 }
      );
    }

    const images = await db.query.image.findMany({
      where: (image, { eq, or }) => {
        const conditions = [];
        if (courtId) conditions.push(eq(image.courtId, courtId));
        if (checkinId) conditions.push(eq(image.checkinId, checkinId));
        return conditions.length === 1 ? conditions[0] : or(...conditions);
      },
    });

    // Add full URL to each image
    const imagesWithUrls = images.map((img) => ({
      ...img,
      url: `${process.env.R2_PUBLIC_URL}/${session.user?.id}/${img.imageId}.webp`,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: imagesWithUrls,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Image fetch error details:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch images",
      }),
      { status: 500 }
    );
  }
};

export const DELETE = async (request: Request) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Please sign in to delete images.",
      }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Image information is missing.",
        }),
        { status: 400 }
      );
    }

    const existingImage = await db.query.image.findFirst({
      where: (image, { eq, and }) =>
        and(eq(image.imageId, id), eq(image.userId, session.user?.id)),
    });

    if (!existingImage) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Image not found or already deleted.",
        }),
        { status: 404 }
      );
    }

    const userId = session.user?.id;

    if (existingImage.userId !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "You can only delete your own images.",
        }),
        { status: 403 }
      );
    }

    // Delete the image from the database
    await db.delete(image).where(eq(image.imageId, id));

    // Delete the image from R2
    const key = `${userId}/${id}.${CONFIG.IMAGE_FORMAT}`;

    await client.send(
      new DeleteObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        Key: key,
      })
    );

    return new Response(
      JSON.stringify({ success: true, message: "Image deleted successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Image deletion error details:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "We're having trouble deleting your image right now. Please try again.",
      }),
      { status: 500 }
    );
  }
};
