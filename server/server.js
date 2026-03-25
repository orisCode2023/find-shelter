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

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

async function bootstrap() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    await createShelters();

    await startRedisListener(io);

    app.use("/shelters", sheltersRouter);

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();

io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
});