import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
import connectDB  from "@/DB/connectDB";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    await connectDB();

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json({ message: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    return NextResponse.json({ message: "Admin registered successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
