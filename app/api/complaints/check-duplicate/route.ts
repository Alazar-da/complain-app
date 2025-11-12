// /app/api/complaints/check-duplicate/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/DB/connectDB";
import Complaint from "@/models/Complaint";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get("mediaUrl");
    const excludeId = searchParams.get("excludeId");

    if (!mediaUrl) {
      return NextResponse.json({ error: "Missing mediaUrl" }, { status: 400 });
    }

    const count = await Complaint.countDocuments({
      mediaUrl,
      _id: { $ne: excludeId },
    });

    const isDuplicate = count > 0;
    return NextResponse.json({ isDuplicate });
  } catch (error: any) {
    console.error("❌ Duplicate check failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
