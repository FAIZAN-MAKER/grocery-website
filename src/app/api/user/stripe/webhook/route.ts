import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const isDev = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature")!;
  const rawBody = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Webhook signature verification failed.", error);
    return new NextResponse("Webhook Error: Invalid signature", {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session?.metadata?.orderId;
    const eventId = event.id;

    if (isDev) console.log(`[Stripe Webhook] Event received: eventId=${eventId}, orderId=${orderId}`);

    if (orderId) {
      await connectDb();
      
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        console.error(`[Stripe Webhook] Order not found: orderId=${orderId}`);
        return new NextResponse("Order not found", { status: 404 });
      }

      if (existingOrder.isPaid === true) {
        if (isDev) console.log(`[Stripe Webhook] Order already paid, skipping: orderId=${orderId}`);
        return new NextResponse("Event received (already processed)", { status: 200 });
      }

      await Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { isPaid: true } },
      );

      if (isDev) console.log(`[Stripe Webhook] Order marked as paid: orderId=${orderId}`);
    }
  }

  return new NextResponse("Event received", { status: 200 });
}
