import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
        }

        const { socketId } = await request.json();
        const user = await User.findByIdAndUpdate(session.user.id, { socketId, isOnline: true }, { new: true });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found", data: null }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Socket ID updated", data: { user } }, { status: 200 });
    } catch (error) {
        console.error("Error updating socket ID:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", data: null }, { status: 500 });
    }
}
