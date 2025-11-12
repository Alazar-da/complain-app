import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // server-only
  signature_algorithm: "sha256",
});

export async function POST(req: Request) {
  try {
    const { public_id, resource_type } = await req.json();

    if (!public_id) {
      return NextResponse.json({ error: "Missing public_id" }, { status: 400 });
    }

    // Default to image if not provided
    const type = resource_type || "image";

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: type,
    });

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else if (result.result === "not found") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    } else {
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ Cloudinary delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
