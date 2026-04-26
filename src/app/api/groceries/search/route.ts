import connectDb from "@/lib/db";
import { Grocery } from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, message: "Search query required", data: [] }, { status: 400 });
    }
    
    const regex = new RegExp(query.trim(), "i");
    
    const groceries = await Grocery.find({
      $or: [
        { name: regex },
        { category: regex },
      ]
    }).limit(50);
    
    return NextResponse.json(
      { success: true, message: "Search results", data: groceries },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed", data: [] },
      { status: 500 }
    );
  }
}