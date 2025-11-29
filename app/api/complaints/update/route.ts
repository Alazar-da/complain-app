import connectDB from "@/DB/connectDB";
import Complaint from "@/models/Complaint";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { status, reason, responsiblePerson } = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Get current complaint to validate status transition
    const currentComplaint = await Complaint.findById(id);
    if (!currentComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      'Pending': ['Appropriate', 'Inappropriate'],
      'Appropriate': ['In Progress', 'Inappropriate'],
      'In Progress': ['Completed', 'Inappropriate'],
      'Completed': [], // Final status
      'Inappropriate': [] // Final status
    };

    const allowedTransitions = validTransitions[currentComplaint.status] || [];
    if (!allowedTransitions.includes(status) && status !== currentComplaint.status) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentComplaint.status} to ${status}` },
        { status: 400 }
      );
    }

    // Validate required fields for completed/inappropriate status
    if ((status === 'Completed' || status === 'Inappropriate') && !reason?.trim()) {
      return NextResponse.json(
        { error: "Reason is required for completed or inappropriate status" },
        { status: 400 }
      );
    }

    if ((status === 'Completed' || status === 'Inappropriate') && !responsiblePerson?.trim()) {
      return NextResponse.json(
        { error: "Responsible person is required for completed or inappropriate status" },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (responsiblePerson?.trim()) {
      updateData.responsiblePerson = responsiblePerson.trim();
    }
    if (reason?.trim()) {
      updateData.reason = reason.trim();
      // Set resolvedAt only when moving to final states
      if (status === 'Completed' || status === 'Inappropriate') {
        updateData.resolvedAt = new Date();
      }
    }

    // If status is changing from completed/inappropriate to something else, clear the fields
    if (status !== 'Completed' && status !== 'Inappropriate') {
      updateData.reason = undefined;
      updateData.responsiblePerson = undefined;
      updateData.resolvedAt = undefined;
    }

    const updated = await Complaint.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );

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
