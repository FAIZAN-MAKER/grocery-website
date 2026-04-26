import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const isDev = process.env.NODE_ENV === "development";

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in your .env file.");
}

// Global cache to prevent connection exhaustion during Next.js Hot Reloading
let cached = (global as any).mongoose;

if (!cached) {
  if (isDev) console.log("🌑 Initializing global MongoDB cache...");
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDb() {
  // Case 1: Return existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    if (isDev) console.log("♻️  Using existing MongoDB connection.");
    return cached.conn;
  }

  // Case 2: Wait if a connection is already in progress
  if (cached.promise) {
    if (isDev) console.log("⏳ Connection in progress, waiting...");
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Case 3: Start a new connection
  if (isDev) console.log("🔌 Connecting to MongoDB with DNS fix...");

  const opts = {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  };

  cached.promise = mongoose
    .connect(MONGODB_URI, opts)
    .then((mongooseInstance) => {
      if (isDev) console.log("✅ MongoDB Connected Successfully (DNS Fixed).");
      return mongooseInstance.connection;
    })
    .catch((error) => {
      console.error("❌ MongoDB Connection Failed:", error.message);
      cached.promise = null; // Reset for next attempt
      throw error;
    });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDb;
