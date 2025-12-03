import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";
import connectDB from "@/DB/connectDB";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    await connectDB();

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return NextResponse.json({ message: "invalid_credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ message: "invalid_credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return NextResponse.json({ message: "login_successful", token }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
