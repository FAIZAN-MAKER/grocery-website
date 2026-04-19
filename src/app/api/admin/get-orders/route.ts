import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const orders = await Order.find({}).populate("user")
        return new Response(JSON.stringify(orders), { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch orders" }), { status: 500 });    
    }
}