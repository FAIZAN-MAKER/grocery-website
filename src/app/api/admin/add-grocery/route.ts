import { auth } from "@/auth";
import { uploadOnCloudinary } from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import { Grocery } from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const formData = await request.formData();

    // 1. Extract and Validate Input
    // ✅ FIX: Extract as strings to match your Mongoose Model
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const unit = formData.get("unit") as string;
    const file = formData.get("image") as Blob | null;

    // ✅ FIX: Check for existence since they are strings (no more isNaN)
    if (!name || !category || !price || !unit || !file) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 },
      );
    }

    // 2. Handle Cloudinary Upload
    const imageUrl = await uploadOnCloudinary(file);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 },
      );
    }

    // 3. Create Database Entry
    const grocery = await Grocery.create({
      name,
      category,
      price, // Mongoose will save this as String
      unit, // Mongoose will validate this against your Enum ["kg", "g", etc.]
      image: imageUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        grocery,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("ADD_PRODUCT_ERROR:", error.message);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
