import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import bcrypt from "bcryptjs";
import connectDb from "@/lib/db";
import { User } from "@/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields", data: null },
        { status: 400 },
      );
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { success: false, message: "User already exists.", data: null },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long", data: null },
        { status: 400 },
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { 
        success: true, message: "User registered successfully", data: {
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
          },
        }
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 },
    );
  }
}
