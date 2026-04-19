import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        const email = session?.user?.email;
        
        if (!email) {
            return new Response(JSON.stringify({ message: "No orders found" }), { status: 404 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ message: "No orders found" }), { status: 404 });
        }

        const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
        
        const ordersWithId = orders.map(order => ({
            ...order.toObject(),
            orderId: `ORD-${order._id.toString().slice(-8).toUpperCase()}`
        }));

        return new Response(JSON.stringify(ordersWithId), { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch orders" }), { status: 500 });
    }
}