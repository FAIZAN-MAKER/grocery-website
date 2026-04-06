import mongoose from "mongoose";

interface IGrocery {
    _id?: mongoose.Types.ObjectId;
    name: string;
    category: string;
    price: string;
    unit: string;
    image: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const grocerySchema = new mongoose.Schema<IGrocery>({
    name: { type: String, required: true },
    price: { type: String, required: true },
    unit: { type: String, required: true, enum: ["kg", "g", "l", "ml", "pcs", "pack"] },
    image: { type: String, required: true },
    category: {
    type: String,
    enum: [
      "Fruits & Vegetables",
      "Dairy & Eggs",
      "Rice, Atta & Grains",
      "Snacks & Buiscuits",
      "Spices & Masalas",
      "Beverages & Drinks",
      "Personal Care",
      "Household Essentials",
      "Instant & Packaged Food",
      "Baby & Pet Care",
    ],
    required: true,
    }
}, { timestamps: true });

export const Grocery = mongoose.models.Grocery || mongoose.model<IGrocery>("Grocery", grocerySchema);
