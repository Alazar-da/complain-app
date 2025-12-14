import imageCompression from "browser-image-compression";

interface UploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Compresses and uploads any file type
 * - Deduplicates using SHA-1 hash
 * - Returns cached URL if already uploaded
 * - Compresses images only (other files uploaded as-is)
 */
export async function compressAndUploadMedia(
  file: File,
  folderPath: string = "complain_app/uploads"
): Promise<UploadResult> {
  try {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");
    const isPDF = file.type.includes("pdf");
    const isDocument = file.type.includes("document") || 
                      file.type.includes("word") || 
                      file.type.includes("excel") ||
                      file.type.includes("sheet") ||
                      file.type.includes("presentation");
    
    // ✅ Determine resource type for Cloudinary
    let resourceType: "image" | "video" | "raw" = "raw";
    if (isImage) resourceType = "image";
    else if (isVideo) resourceType = "video";
    // Audio, PDF, documents, etc. will use "raw"

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

    // ✅ Step 3: Compress image if needed (only compress images)
    let uploadFile: File = file;
    if (isImage) {
      try {
        uploadFile = await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
      } catch (compressError) {
        console.warn("Image compression failed, uploading original:", compressError);
        uploadFile = file;
      }
    }

    // ✅ Step 4: Get Cloudinary signature
    const sigRes = await fetch("/api/sign-cloudinary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        folder: folderPath,
        resource_type: resourceType 
      }),
    });

    if (!sigRes.ok) {
      const errorText = await sigRes.text();
      console.error("Failed to get Cloudinary signature:", errorText);
      throw new Error("Failed to get Cloudinary signature");
    }
    
    const { signature, timestamp } = await sigRes.json();

    // ✅ Step 5: Prepare FormData
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append("resource_type", resourceType);
    
    if (folderPath) formData.append("folder", folderPath);

    // Add additional parameters for different file types
    if (isImage) {
      // Optimize images for web
      formData.append("quality", "auto:good");
      formData.append("fetch_format", "auto");
    } else if (isVideo) {
      // Optimize videos
      formData.append("quality", "auto:good");
    }

    // ✅ Step 6: Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: "POST", body: formData }
    );

    const data = await uploadRes.json();
    if (!uploadRes.ok) {
      console.error("Cloudinary upload error:", data);
      throw new Error(data.error?.message || `Upload failed: ${uploadRes.statusText}`);
    }

    // ✅ Step 7: Cache URL for future deduplication
    localStorage.setItem(`uploaded_${fileHash}`, data.secure_url);

    return { secure_url: data.secure_url, public_id: data.public_id };
  } catch (err) {
    console.error("❌ Error uploading media:", err);
    throw new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}