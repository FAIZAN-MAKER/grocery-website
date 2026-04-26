import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const adminExists = await User.findOne({ role: "admin" });
        return NextResponse.json(
            { success: true, message: "Admin check completed", data: { adminExists: !!adminExists } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking admin:", error);
        return NextResponse.json(
            { success: false, message: "Failed to check admin", data: null },
            { status: 500 }
        );
    }
}