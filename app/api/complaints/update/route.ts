import { NextResponse } from "next/server";
import Complaint from "@/models/Complaint";
import connectDB from "@/DB/connectDB";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { status } = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const updated = await Complaint.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
