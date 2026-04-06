import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import connectDb from '@/lib/db'
import { Grocery } from '@/models/grocery.model'
import GroceryItemCard from './GroceryItemCard'
import { ShoppingBag } from 'lucide-react'

const UserDashboard = async () => {
  await connectDb()

  const rawGroceries = await Grocery.find({}).sort({ createdAt: -1 }).lean();

  const groceries = rawGroceries.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
  }));

  return (
    <div className="min-h-screen pb-20 font-poppins bg-white">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategorySlider />

        <div className="mt-16 mb-10 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-2xl text-green-600 shadow-sm">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Popular Grocery Items
            </h2>
            <p className="text-gray-500">Fresh picks delivered in 10 minutes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {groceries.map((item, index) => (
            <GroceryItemCard key={item._id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
