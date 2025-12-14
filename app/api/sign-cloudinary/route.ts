import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  signature_algorithm: "sha256",
});

export async function POST(request: Request) {
  try {
    const { folder } = await request.json();

    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, any> = {
      timestamp,
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    };

    if (folder) paramsToSign.folder = folder;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return Response.json({ signature, timestamp });
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    return Response.json({ error: "Signature failed" }, { status: 500 });
  }
}
