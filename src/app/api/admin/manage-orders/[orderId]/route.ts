import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { io } from "socket.io-client";

const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";
const VALID_ORDER_STATUSES = ["pending", "accepted", "out for delivery", "delivered"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        await connectDb();
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 403 });
        }

        const { orderId } = await params;
        const body = await req.json();
        const { status } = body;

        if (!status || !VALID_ORDER_STATUSES.includes(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid status. Must be 'pending', 'accepted', 'out for delivery', or 'delivered'", data: null },
                { status: 400 }
            );
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found", data: null },
                { status: 404 }
            );
        }

        order.status = status;
        await order.save();

        try {
            const socket = io(socketServerUrl, { autoConnect: false });
            socket.connect();
            socket.emit("order-status-update", {
                orderId,
                status,
                userId: order.user?.toString(),
                deliveryBoyId: order.assignedDeliveryBoy?.toString(),
            });
            socket.disconnect();
        } catch (socketErr) {
            console.error("Socket emission error:", socketErr);
        }

        return NextResponse.json(
            { success: true, message: "Order status updated successfully", data: { order } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update order status", data: null },
            { status: 500 }
        );
    }
}