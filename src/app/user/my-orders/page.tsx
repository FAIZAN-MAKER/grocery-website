"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Package, ShoppingBag, CreditCard, Banknote, Clock, Truck, CheckCircle2 } from "lucide-react";
import axios from "axios";

interface OrderItem {
  _id: string;
  name: string;
  price: string;
  image: string;
  unit: string;
  quantity: number;
}

interface OrderAddress {
  fullName: string;
  mobile: string;
  city: string;
  state: string;
  pinCode: string;
  fullAddress: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: string;
  paymentMethod: "cod" | "online";
  isPaid: boolean;
  address: OrderAddress;
  status: "pending" | "out for delivery" | "delivered";
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Clock,
  },
  "out for delivery": {
    label: "Out for Delivery",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

const GOLD = "#c8a96e";

// ─── Product Image Grid ───────────────────────────────────────────────────────
const ProductGrid = ({ items }: { items: OrderItem[] }) => {
  const visible = items.slice(0, 2);
  const extra = items.length - 2;

  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `1fr 1fr${extra > 0 ? " 1fr" : ""}` }}>
      {visible.map((item, i) => (
        <div
          key={item._id || i}
          className="relative bg-[#161616] overflow-hidden"
          style={{ aspectRatio: "1" }}
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-4"
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2"
            style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}
          >
            <p className="text-xs font-medium text-white/90 truncate">{item.name}</p>
            <p className="text-[10px] text-white/40 mt-0.5">×{item.quantity} {item.unit}</p>
          </div>
        </div>
      ))}

      {extra > 0 && (
        <div
          className="flex flex-col items-center justify-center bg-[#1a1a1a]"
          style={{ aspectRatio: "1" }}
        >
          <span
            className="font-serif text-3xl font-bold leading-none"
            style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}
          >
            +{extra}
          </span>
          <span className="text-[10px] tracking-widest uppercase text-white/30 mt-1">more</span>
        </div>
      )}
    </div>
  );
};

// ─── Pill Badge ───────────────────────────────────────────────────────────────
const Pill = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase px-2.5 py-1.5 rounded-sm border ${className}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />
    {children}
  </span>
);

// ─── Item Row ─────────────────────────────────────────────────────────────────
const ItemRow = ({ item }: { item: OrderItem }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] rounded-sm">
    <div className="relative w-11 h-11 bg-[#1a1a1a] rounded-sm overflow-hidden flex-shrink-0">
      <Image src={item.image} alt={item.name} fill className="object-contain p-1.5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white/80 truncate">{item.name}</p>
      <p className="text-xs text-white/30 mt-0.5">Rs. {item.price} / {item.unit} · ×{item.quantity}</p>
    </div>
    <p className="text-sm font-medium flex-shrink-0" style={{ color: GOLD }}>
      Rs. {(parseFloat(item.price) * item.quantity).toFixed(0)}
    </p>
  </div>
);

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, index }: { order: Order; index: number }) => {
  const StatusIcon = statusConfig[order.status].icon;
  const isActive = order.status === "out for delivery";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#111111] border border-white/[0.06] rounded-sm overflow-hidden hover:border-white/[0.1] transition-colors duration-300"
    >
      {/* Image grid — always visible */}
      <ProductGrid items={order.items} />

      {/* Card body */}
      <div className="p-5 space-y-4">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-1">
              #{order.orderId || order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-[15px] font-medium text-white/80">{formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] tracking-[0.12em] uppercase text-white/25 mb-1">Total</p>
            <p
              className="text-2xl font-bold leading-none"
              style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}
            >
              Rs. {order.totalAmount}
            </p>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          <Pill className={statusConfig[order.status].color}>
            <StatusIcon size={10} className="opacity-0 w-0" />
            {statusConfig[order.status].label}
          </Pill>
          <Pill className={order.isPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
            {order.isPaid ? "Paid" : "Unpaid"}
          </Pill>
          <Pill className="bg-white/5 text-white/40 border-white/10">
            {order.paymentMethod === "cod" ? (
              <><Banknote size={10} className="inline" /> Cash on Delivery</>
            ) : (
              <><CreditCard size={10} className="inline" /> Online</>
            )}
          </Pill>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] rounded-sm border border-white/[0.05]">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(200,169,110,0.1)" }}
          >
            <MapPin size={12} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">{order.address.fullName}</p>
            <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
              {order.address.fullAddress}<br />
              {order.address.city}, {order.address.state} — {order.address.pinCode} · {order.address.mobile}
            </p>
          </div>
        </div>

        {/* Full item list — always shown for active orders, or all orders */}
        {(isActive || order.items.length <= 3) && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] tracking-[0.18em] uppercase text-white/20 mb-2">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
            {order.items.map((item, i) => (
              <ItemRow key={item._id || i} item={item} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-24"
  >
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
      style={{ background: "rgba(200,169,110,0.08)", border: "0.5px solid rgba(200,169,110,0.15)" }}
    >
      <ShoppingBag size={32} style={{ color: GOLD }} />
    </div>
    <h3
      className="text-2xl font-bold mb-2"
      style={{ fontFamily: "'Playfair Display', serif", color: "#f0ece4" }}
    >
      No orders yet.
    </h3>
    <p className="text-sm text-white/30 mb-8">Your order history will appear here</p>
    <Link href="/">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-6 py-3 text-sm font-medium tracking-widest uppercase rounded-sm transition-colors"
        style={{ background: GOLD, color: "#0a0a0a" }}
      >
        Start Shopping
      </motion.button>
    </Link>
  </motion.div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-0.5">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-[#111] border border-white/[0.05] rounded-sm overflow-hidden animate-pulse">
        <div className="grid grid-cols-3 gap-0.5">
          {[0, 1, 2].map((j) => (
            <div key={j} className="aspect-square bg-white/[0.04]" />
          ))}
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-2.5 w-20 bg-white/[0.06] rounded" />
              <div className="h-4 w-28 bg-white/[0.06] rounded" />
            </div>
            <div className="h-7 w-20 bg-white/[0.06] rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-24 bg-white/[0.06] rounded" />
            <div className="h-6 w-16 bg-white/[0.06] rounded" />
          </div>
          <div className="h-16 bg-white/[0.04] rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/user/my-orders");
        const data = res.data;
        if (Array.isArray(data)) setOrders(data);
        else if (data._id) setOrders([data]);
        else setOrders([]);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <>
      {/* Playfair Display font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');`}</style>

      <div className="min-h-screen bg-[#0a0a0a] pb-16 pt-6">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-10"
          >
            <Link href="/">
              <motion.button
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-xs tracking-widest uppercase font-medium"
              >
                <ArrowLeft size={14} />
                Back
              </motion.button>
            </Link>

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(200,169,110,0.12)", border: "0.5px solid rgba(200,169,110,0.2)" }}
              >
                <Package size={14} style={{ color: GOLD }} />
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">
                Order History
              </span>
            </div>
          </motion.div>

          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-10 pb-8 border-b border-white/[0.06]"
          >
            <p className="text-[11px] tracking-[0.22em] uppercase mb-3" style={{ color: GOLD }}>
              Your Orders
            </p>
            <h1
              className="text-5xl font-black leading-[1.05] text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {loading ? "Loading…" : orders.length === 0
                ? "Nothing here."
                : `${orders.length} deliver${orders.length === 1 ? "y" : "ies"},`}
            </h1>
            {!loading && orders.length > 0 && (
              <h1
                className="text-5xl font-black leading-[1.05]"
                style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}
              >
                all accounted for.
              </h1>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <Skeleton key="skeleton" />
            ) : orders.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              <div key="orders" className="space-y-0.5">
                {orders.map((order, i) => (
                  <OrderCard key={order._id} order={order} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-center text-xs text-red-400/60 mt-6">{error}</p>
          )}
        </div>
      </div>
    </>
  );
}