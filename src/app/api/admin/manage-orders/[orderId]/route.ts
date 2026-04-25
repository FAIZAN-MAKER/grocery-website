import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        await connectDb();
        const { orderId } = await params;
        const body = await req.json();
        const { status } = body;

        const validStatuses = ["pending", "out for delivery", "delivered"];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json(
                { message: "Invalid status. Must be 'pending', 'out for delivery', or 'delivered'" },
                { status: 400 }
            );
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { message: "Order not found" },
                { status: 404 }
            );
        }

        order.status = status;
        await order.save();

        return NextResponse.json(
            { message: "Order status updated successfully", order },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { message: "Failed to update order status" },
            { status: 500 }
        );
    }
}