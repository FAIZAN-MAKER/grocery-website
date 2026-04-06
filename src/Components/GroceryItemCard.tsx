"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ShoppingBasket, Tag } from 'lucide-react'
import mongoose from "mongoose"

interface IGrocery {
    _id?: mongoose.Types.ObjectId
    name: string
    category: string
    price: string
    unit: string
    image: string
    createdAt?: Date
    updatedAt?: Date
}

interface GroceryItemCardProps {
    item: IGrocery
    index: number
    onAddToCart?: (item: IGrocery, quantity: number) => void
}

const GroceryItemCard = ({ item, index, onAddToCart }: GroceryItemCardProps) => {
    const [quantity, setQuantity] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    const handleAdd = () => {
        const newQty = quantity + 1
        setQuantity(newQty)
        onAddToCart?.(item, newQty)
    }

    const handleRemove = () => {
        if (quantity > 0) {
            const newQty = quantity - 1
            setQuantity(newQty)
            onAddToCart?.(item, newQty)
        }
    }

    const getCategoryStyle = (category: string) => {
        const styles: Record<string, { gradient: string; iconColor: string; bgColor: string }> = {
            "Fruits & Vegetables": {
                gradient: "from-green-500 via-emerald-500 to-teal-600",
                iconColor: "text-green-600",
                bgColor: "bg-green-50"
            },
            "Dairy & Eggs": {
                gradient: "from-blue-400 via-indigo-500 to-purple-600",
                iconColor: "text-blue-600",
                bgColor: "bg-blue-50"
            },
            "Rice, Atta & Grains": {
                gradient: "from-amber-400 via-orange-500 to-yellow-600",
                iconColor: "text-amber-600",
                bgColor: "bg-amber-50"
            },
            "Snacks & Buiscuits": {
                gradient: "from-pink-400 via-rose-500 to-red-500",
                iconColor: "text-pink-600",
                bgColor: "bg-pink-50"
            },
            "Spices & Masalas": {
                gradient: "from-red-500 via-orange-600 to-amber-600",
                iconColor: "text-red-600",
                bgColor: "bg-red-50"
            },
            "Beverages & Drinks": {
                gradient: "from-cyan-400 via-blue-500 to-indigo-600",
                iconColor: "text-cyan-600",
                bgColor: "bg-cyan-50"
            },
            "Personal Care": {
                gradient: "from-purple-400 via-violet-500 to-fuchsia-600",
                iconColor: "text-purple-600",
                bgColor: "bg-purple-50"
            },
            "Household Essentials": {
                gradient: "from-gray-500 via-slate-600 to-zinc-700",
                iconColor: "text-gray-600",
                bgColor: "bg-gray-50"
            },
            "Instant & Packaged Food": {
                gradient: "from-orange-400 via-red-500 to-pink-600",
                iconColor: "text-orange-600",
                bgColor: "bg-orange-50"
            },
            "Baby & Pet Care": {
                gradient: "from-sky-400 via-blue-500 to-indigo-600",
                iconColor: "text-sky-600",
                bgColor: "bg-sky-50"
            }
        }
        return styles[category] || styles["Fruits & Vegetables"]
    }

    const categoryStyle = getCategoryStyle(item.category)

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.23, 1, 0.32, 1]
            }}
            viewport={{ once: true, margin: "-50px" }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative"
        >
            <motion.div
                className={`absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r ${categoryStyle.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}
                animate={{ opacity: isHovered ? 0.25 : 0 }}
            />

            <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-gray-100/50">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${categoryStyle.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`relative h-48 w-full overflow-hidden ${categoryStyle.bgColor}/30`}>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:16px_16px]" />
                    </div>

                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-4 left-4 z-20"
                    >
                        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                            <Tag size={12} className={categoryStyle.iconColor} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                                {item.category}
                            </span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative w-full h-full flex items-center justify-center p-6"
                        animate={{ y: isHovered ? -5 : 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                            </div>
                        )}
                        <motion.img
                            src={item.image}
                            alt={item.name}
                            onLoad={() => setImageLoaded(true)}
                            className="w-full h-full object-contain drop-shadow-xl"
                            animate={{
                                scale: isHovered ? 1.08 : 1,
                                rotate: isHovered ? 1 : 0
                            }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                        />
                    </motion.div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                </div>

                <div className="relative p-5 pt-3">
                    <div className="mb-1">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300 line-clamp-2">
                            {item.name}
                        </h3>
                    </div>

                    <div className="mb-4">
                        <span className={`inline-block text-xs font-semibold ${categoryStyle.iconColor} ${categoryStyle.bgColor} px-2.5 py-1 rounded-lg uppercase tracking-wide`}>
                            {item.unit}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium mb-0.5">Price</span>
                            <motion.span
                                className="text-2xl font-black text-gray-900"
                                animate={{ scale: isHovered ? 1.02 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="text-lg font-semibold text-gray-500 mr-1">Rs.</span>
                                {item.price}
                            </motion.span>
                        </div>

                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {quantity === 0 ? (
                                    <motion.button
                                        key="add"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAdd}
                                        className={`relative overflow-hidden flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r ${categoryStyle.gradient} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                                    >
                                        <ShoppingBasket size={18} />
                                        <span className="text-sm font-bold">Add</span>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                                            animate={{ x: ['-200%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        />
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="counter"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-2 bg-gray-900 rounded-2xl p-1.5 shadow-lg"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleRemove}
                                            className="p-2.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer"
                                        >
                                            <Minus size={16} strokeWidth={2.5} />
                                        </motion.button>

                                        <motion.span
                                            key={quantity}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="w-10 text-center text-white font-bold text-lg"
                                        >
                                            {quantity}
                                        </motion.span>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleAdd}
                                            className={`p-2.5 rounded-xl bg-gradient-to-r ${categoryStyle.gradient} text-white shadow-md cursor-pointer`}
                                        >
                                            <Plus size={16} strokeWidth={2.5} />
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default GroceryItemCard
