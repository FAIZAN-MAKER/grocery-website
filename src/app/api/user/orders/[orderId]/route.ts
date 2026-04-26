import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
    }

    const { orderId } = await params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("assignedDeliveryBoy", "name email image mobile");

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found", data: null }, { status: 404 });
    }

    const orderUserId = order.user instanceof Object ? (order.user as any)._id?.toString() : order.user?.toString();
    if (orderUserId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: "Order fetched successfully", data: { order } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch order", data: null }, { status: 500 });
  }
}