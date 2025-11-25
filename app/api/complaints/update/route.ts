import connectDB from "@/DB/connectDB";
import Complaint from "@/models/Complaint";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { status, reason } = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate required reason for completed/canceled status
    if ((status === 'Completed' || status === 'Canceled') && !reason?.trim()) {
      return NextResponse.json(
        { error: "Reason is required for completed or canceled status" },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (reason?.trim()) {
      updateData.reason = reason.trim();
      updateData.resolvedAt = new Date();
    }

    // If status is changing from completed/canceled to something else, clear the reason
    if (status !== 'Completed' && status !== 'Canceled') {
      updateData.reason = undefined;
      updateData.resolvedAt = undefined;
    }

    const updated = await Complaint.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
      const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await Complaint.findByIdAndDelete(id);
    return NextResponse.json({ message: "Complaint deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
