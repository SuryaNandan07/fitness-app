import mongoose from "mongoose";

function isMongoAuthError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.toLowerCase().includes("authentication failed") ||
      error.message.toLowerCase().includes("bad auth"))
  );
}

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI?.trim().replace(/^["']|["']$/g, "");

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME?.trim() || undefined,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    if (isMongoAuthError(error)) {
      console.error(
        "Check the MongoDB username/password, database user permissions, authSource, and URL-encoding for special characters in MONGO_URI."
      );
    }
    throw error;
  }
}
