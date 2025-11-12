import { NextResponse } from "next/server";
import connectDB from "@/DB/connectDB";
import Complaint from "@/models/Complaint";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Complaint ID is required" }, { status: 400 });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: { mediaUrl: "" } },
      { new: true }
    );

    if (!updatedComplaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Media URL cleared successfully",
      complaint: updatedComplaint,
    });
  } catch (error: any) {
    console.error("Error clearing media URL:", error);
    return NextResponse.json({ error: "Failed to clear media URL" }, { status: 500 });
  }
}
