import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import sheltersRouter from "./src/routers/shelters.router.js";
import dotenv from "dotenv";
import { connectDB } from "./src/db/mongo.js";
import { createShelters } from "./src/services/putShelters.js";
import startRedisListener from "./src/services/redisListeners.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// הגדרת Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// פונקציית אתחול המערכת
async function bootstrap() {
  try {
    // 1. חיבור למסד הנתונים
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // 2. יצירת/עדכון מקלטים ב-DB (במידה ויש לכם לוגיקת Seed)
    await createShelters();

    // 3. הפעלת המאזין ל-Redis (מקבל מדניאל ומפיץ ל-Socket)
    await startRedisListener(io);

    // 4. נתיבי API רגילים (עבור הצוות שבונה את רשימת המקלטים)
    app.use("/shelters", sheltersRouter);

    // הפעלת השרת
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();

// ניהול חיבורי לקוחות
io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
});