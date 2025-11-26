import connectDB from "@/DB/connectDB";
import Complaint from "@/models/Complaint";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();

    const complaint = await Complaint.create(data);

    return NextResponse.json(
      {
        success: true,
        complaint: {
          id: complaint._id,
          trackingNumber: complaint.trackingNumber,
          status: complaint.status,
          title: complaint.title,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const searchTerm = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status") || "All";

    // Build MongoDB query
    const query: any = {};

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { department: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (statusFilter !== "All") {
      query.status = statusFilter;
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      data: complaints,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


