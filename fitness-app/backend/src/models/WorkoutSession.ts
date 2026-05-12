import mongoose from "mongoose";

const workoutSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        exercise: {
            type: String,
            required: true,
        },

        totalReps: {
            type: Number,
            default: 0,
        },

        goodReps: {
            type: Number,
            default: 0,
        },

        badReps: {
            type: Number,
            default: 0,
        },

        accuracy: {
            type: Number,
            default: 0,
        },

        duration: {
            type: Number,
            default: 0,
        },

        mistakes: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

export const WorkoutSession = mongoose.model(
    "WorkoutSession",
    workoutSessionSchema,
);