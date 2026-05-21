import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/database";
import authRoutes from "./routes/authRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import workoutRoutes from "./routes/workoutRoutes";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Fitness backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/recommendations", recommendationRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀  Server running on port ${PORT}`);
});
