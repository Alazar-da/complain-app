import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";
import connectDB from "@/DB/connectDB";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
   
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

    await connectDB();
    const admin = await Admin.findById(id).select("username");
    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ username: admin.username });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { username } = await req.json();

    await connectDB();
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    admin.username = username;
    await admin.save();

    // Create NEW TOKEN with updated username
    const newToken = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "User Name updated successfully",
      token: newToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

