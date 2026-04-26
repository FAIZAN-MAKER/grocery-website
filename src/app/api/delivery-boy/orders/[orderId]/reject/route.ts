import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "@/models/user.model";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
    }

    const { orderId } = await params;
    const deliveryBoy = await User.findOne({ 
      email: session.user.email, 
      role: "deliveryBoy"
    });
    
    if (!deliveryBoy) {
      return NextResponse.json({ success: false, message: "Only delivery boys can reject orders", data: null }, { status: 403 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found", data: null }, { status: 404 });
    }

    // Rejecting keeps the order available for reassignment in delivery queue
    order.assignedDeliveryBoy = null;
    order.status = "out for delivery";
    await order.save();

    return NextResponse.json({ 
      success: true, message: "Order rejected successfully", data: { 
        _id: order._id,
        status: order.status,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error rejecting order:", error);
    return NextResponse.json({ success: false, message: "Failed to reject order", data: null }, { status: 500 });
  }
}