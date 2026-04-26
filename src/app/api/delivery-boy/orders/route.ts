import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "@/models/user.model";

const DELIVERY_VISIBLE_STATUSES = ["out for delivery", "accepted"] as const;

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (session?.user?.role !== "deliveryBoy") {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 403 });
    }
    
    if (process.env.NODE_ENV === "development") {
      console.log("Session:", session?.user);
    }
    
    // Return available + accepted orders for now
    const orders = await Order.find({
      $or: [
        { status: DELIVERY_VISIBLE_STATUSES[0] },
        { status: DELIVERY_VISIBLE_STATUSES[1] },
      ]
    })
      .populate("user")
      .populate("assignedDeliveryBoy", "name email image mobile")
      .sort({ createdAt: -1 });
    
    if (process.env.NODE_ENV === "development") {
      console.log("Found orders:", orders.length, orders.map((o: any) => ({ id: o._id, status: o.status })));
    }
    
    return NextResponse.json({ success: true, message: "Orders fetched successfully", data: orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch orders", data: null }, { status: 500 });
  }
}