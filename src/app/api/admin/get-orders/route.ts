import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 403 });
        }

        const orders = await Order.find({}).populate("user")
        return NextResponse.json({ success: true, message: "Orders fetched successfully", data: orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders", data: null }, { status: 500 });
    }
}