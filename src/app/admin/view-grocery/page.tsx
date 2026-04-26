"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Loader2 } from "lucide-react";
import GroceryItemCard from "@/Components/GroceryItemCard";
import { IGrocery } from "@/redux/cartSlice";

async function fetchProducts() {
  const res = await fetch("/api/admin/exists");
  if (!res.ok) throw new Error("Failed to fetch");
  return [];
}

export default function ViewGroceryPage() {
  const [items, setItems] = useState<IGrocery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="p-3 bg-green-100 rounded-2xl text-green-600">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">View Products</h1>
            <p className="text-gray-500">{items.length} products in inventory</p>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <GroceryItemCard key={item._id?.toString() || index} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}