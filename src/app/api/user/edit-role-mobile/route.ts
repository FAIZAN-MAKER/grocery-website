import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { role, mobile } = await req.json();
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { role, mobile },
    );
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
