const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
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

    reps: {
      type: Number,
      default: 0,
    },

    duration: {
      type: Number,
      default: 0,
    },

    calories: {
      type: Number,
      default: 0,
    },

    correctReps: {
      type: Number,
      default: 0,
    },

    wrongReps: {
      type: Number,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Workout", workoutSchema);
