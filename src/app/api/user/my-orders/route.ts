import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
        }

        const orders = await Order.find({ user: session.user.id })
            .populate("user")
            .populate("assignedDeliveryBoy", "name email image mobile")
            .sort({ createdAt: -1 });
        
        return NextResponse.json({ success: true, message: "Orders fetched successfully", data: orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders", data: null }, { status: 500 });
    }
}