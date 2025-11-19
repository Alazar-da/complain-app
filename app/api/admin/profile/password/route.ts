import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
import connectDB from "@/DB/connectDB";

export async function PUT(req: Request) {
  try {
 const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
    const { oldPassword, newPassword } = await req.json();

    await connectDB();
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Old password incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
