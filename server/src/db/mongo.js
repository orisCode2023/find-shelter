import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

let client;
let db;

export async function connectDB() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("❌ MONGO_URI is undefined. Check your .env file and path.");
    }

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(process.env.DB_NAME);
        
        await db.collection('shelters').createIndex({ location: "2dsphere" });
        
        console.log("✅ MongoDB connected to:", process.env.DB_NAME);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        throw error;
    }
}


export function getDB() {
    if (!db) throw new Error("Database not initialized");
    return db;
}