import imageCompression from "browser-image-compression";

interface UploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Compresses and uploads image/video
 * - Deduplicates using SHA-1 hash
 * - Returns cached URL if already uploaded
 */
export async function compressAndUploadMedia(
  file: File,
  folderPath: string = "complain_app/uploads"
): Promise<UploadResult> {
  try {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      throw new Error("Only image and video files are allowed.");
    }

    const isImage = file.type.startsWith("image/");

    // ✅ Step 1: Generate SHA-1 hash for deduplication
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
    const fileHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // ✅ Step 2: Check localStorage first
    const cachedUrl = localStorage.getItem(`uploaded_${fileHash}`);
    if (cachedUrl) {
      console.log("⚡ Duplicate detected — returning cached URL");
      return { secure_url: cachedUrl, public_id: `${folderPath}/${fileHash}` };
    }

    // ✅ Step 3: Compress image if needed
    let uploadFile: File = file;
    if (isImage) {
      uploadFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
    }

    // ✅ Step 4: Get Cloudinary signature
    const sigRes = await fetch("/api/sign-cloudinary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: folderPath }),
    });

    if (!sigRes.ok) throw new Error("Failed to get Cloudinary signature");
    const { signature, timestamp } = await sigRes.json();

    // ✅ Step 5: Prepare FormData
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    if (folderPath) formData.append("folder", folderPath);

    // ✅ Step 6: Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${isImage ? "image" : "video"}/upload`,
      { method: "POST", body: formData }
    );

    const data = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(data.error?.message || "Upload failed");

    // ✅ Step 7: Cache URL for future deduplication
    localStorage.setItem(`uploaded_${fileHash}`, data.secure_url);

    return { secure_url: data.secure_url, public_id: data.public_id };
  } catch (err) {
    console.error("❌ Error uploading media:", err);
    throw err;
  }
}
