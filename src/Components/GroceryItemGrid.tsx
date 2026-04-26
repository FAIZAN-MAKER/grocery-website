"use client"
import React, { useState } from 'react'
import GroceryItemCard from './GroceryItemCard'
import { motion } from 'framer-motion'

const GroceryItemGrid = ({ initialItems }: { initialItems: any[] }) => {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <GroceryItemCard key={item._id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}

export default GroceryItemGrid
