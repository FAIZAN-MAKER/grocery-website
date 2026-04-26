import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Grocery } from "@/models/grocery.model";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
    }

    const { items, totalAmount, paymentMethod, address } = await request.json();
    if (!items || !totalAmount || !paymentMethod || !address) {
      return NextResponse.json({ success: false, message: "Missing required fields", data: null }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Missing required fields", data: null }, { status: 400 });
    }
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found", data: null }, { status: 404 });
    }

    const groceryIds = items
      .map((item) => item?.grocery)
      .filter(Boolean)
      .map((id) => id.toString());

    const groceries = await Grocery.find({ _id: { $in: groceryIds } });
    const groceryMap = new Map(groceries.map((grocery) => [grocery._id.toString(), grocery]));

    const validatedItems = [];
    let computedTotal = 0;

    for (const item of items) {
      const groceryId = item?.grocery?.toString();
      const grocery = groceryMap.get(groceryId);
      const quantity = Number(item?.quantity);

      if (!grocery || !Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json({ success: false, message: "Invalid items", data: null }, { status: 400 });
      }

      const unitPrice = parseFloat(grocery.price);
      if (!Number.isFinite(unitPrice)) {
        return NextResponse.json({ success: false, message: "Invalid items", data: null }, { status: 400 });
      }

      computedTotal += unitPrice * quantity;
      validatedItems.push({
        grocery: grocery._id,
        quantity,
        name: grocery.name,
        price: grocery.price,
        image: grocery.image,
        unit: grocery.unit,
      });
    }

    const newOrder = await Order.create({
      user: session.user.id,
      items: validatedItems,
      totalAmount: computedTotal.toFixed(2),
      paymentMethod,
      address
    });

    return NextResponse.json({ success: true, message: "Order created successfully", data: { order: newOrder } }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ success: false, message: "Failed to create order", data: null }, { status: 500 });
  }
}
