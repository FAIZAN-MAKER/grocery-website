import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const adminExists = await User.findOne({ role: "admin" });
        return NextResponse.json(
            { adminExists: !!adminExists },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking admin:", error);
        return NextResponse.json(
            { message: "Failed to check admin" },
            { status: 500 }
        );
    }
}