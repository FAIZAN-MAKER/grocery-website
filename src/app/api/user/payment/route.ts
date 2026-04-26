import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Grocery } from "@/models/grocery.model";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
    }

    const { items, totalAmount, address } = await request.json();

    if (!items || !totalAmount || !address) {
      return NextResponse.json({ success: false, message: "Missing required fields", data: null }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Missing required fields", data: null }, { status: 400 });
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
      paymentMethod: "online",
      address,
      status: "pending",
    });

    // 2. Build Stripe line items
    const lineItems = validatedItems.map((item: {
      name: string; price: string; quantity: number; image: string;
    }) => ({
      price_data: {
        currency: "pkr",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    // 3. Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: newOrder._id.toString(), // webhook reads this to mark order as paid
      },
      success_url: `${process.env.NEXT_BASE_URL}/user/order-success?orderId=${newOrder._id}`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/checkout?cancelled=true`,
    });

    return NextResponse.json({ success: true, message: "Payment session created", data: { url: stripeSession.url } }, { status: 200 });

  } catch (error) {
    console.error("[Stripe Payment API]", error);
    return NextResponse.json({ success: false, message: "Failed to create payment session", data: null }, { status: 500 });
  }
}
