import connectDB from "@/DB/connectDB";
import Complaint from "@/models/Complaint";
import { NextResponse } from "next/server";

export async function GET(
  req: Request
) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get("trackingNumber");

    const complaint = await Complaint.findOne({ trackingNumber });

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, complaint },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
