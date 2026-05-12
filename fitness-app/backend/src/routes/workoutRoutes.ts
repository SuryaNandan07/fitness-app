import express, { RequestHandler } from "express";
import { WorkoutSession } from "../models/WorkoutSession";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

const saveWorkout: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;

        const {
            exercise,
            totalReps,
            goodReps,
            badReps,
            accuracy,
            duration,
            mistakes,
        } = req.body;

        if (!exercise) {
            res.status(400).json({ message: "Exercise is required" });
            return;
        }

        if (!authReq.userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const session = await WorkoutSession.create({
            userId: authReq.userId,
            exercise,
            totalReps: totalReps ?? 0,
            goodReps: goodReps ?? 0,
            badReps: badReps ?? 0,
            accuracy: accuracy ?? 0,
            duration: duration ?? 0,
            mistakes: mistakes ?? [],
        });

        res.status(201).json({
            message: "Workout saved",
            session,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to save workout",
            error,
        });
    }
};

const getHistory: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;

        if (!authReq.userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const sessions = await WorkoutSession.find({
            userId: authReq.userId,
        }).sort({ createdAt: -1 });

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch history",
            error,
        });
    }
};

const getSummary: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;

        if (!authReq.userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const sessions = await WorkoutSession.find({
            userId: authReq.userId,
        });

        const totalWorkouts = sessions.length;

        const totalReps = sessions.reduce(
            (sum, item) => sum + (item.totalReps || 0),
            0,
        );

        const goodReps = sessions.reduce(
            (sum, item) => sum + (item.goodReps || 0),
            0,
        );

        const badReps = sessions.reduce(
            (sum, item) => sum + (item.badReps || 0),
            0,
        );

        const accuracy =
            totalReps > 0 ? Math.round((goodReps / totalReps) * 100) : 0;

        res.json({
            totalWorkouts,
            totalReps,
            goodReps,
            badReps,
            accuracy,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch summary",
            error,
        });
    }
};

router.post("/save", authMiddleware, saveWorkout);
router.get("/history", authMiddleware, getHistory);
router.get("/summary", authMiddleware, getSummary);

export default router;