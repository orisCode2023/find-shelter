import express from "express";
import cors from "cors";
import sheltersRouter from "./src/routers/shelters.router.js";
import dotenv from "dotenv";
import { connectDB } from "./src/db/mongo.js";
import { createShelters } from "./src/services/putShelters.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


await connectDB();
await createShelters();

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Methods', ['GET', 'POST','PUT','PATCH', 'DELETE', 'OPTIONS']);
//     res.header('Access-Control-Allow-Headers', "Content-Type");
//     next()
// })
app.use("/shelters", sheltersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost: ${PORT}`);
});
