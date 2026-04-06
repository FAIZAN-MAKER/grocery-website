"use client"
import React, { useState } from 'react'
import GroceryItemCard from './GroceryItemCard'
import { motion } from 'framer-motion'

const GroceryItemGrid = ({ initialItems }: { initialItems: any[] }) => {
  const [items, setItems] = useState(initialItems);

  // This is where you'll eventually add your fetch logic for "Load More"
  const handleLoadMore = () => {
    console.log("Fetching next 8 items from API...");
  };

  return (
    <div className="w-full">
      {/* The Actual Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <GroceryItemCard key={item._id} item={item} index={index} />
        ))}
      </div>

      {/* Modern "Explore" Button */}
      <div className="mt-12 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLoadMore}
          className="px-10 py-4 rounded-2xl bg-white border-2 border-green-600 text-green-600 font-bold hover:bg-green-600 hover:text-white transition-all shadow-md"
        >
          Explore More Products
        </motion.button>
      </div>
    </div>
  )
}

export default GroceryItemGrid
