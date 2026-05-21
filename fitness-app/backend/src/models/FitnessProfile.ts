import mongoose, { Document, Schema } from "mongoose";

export interface IFitnessProfile extends Document {
  userId: mongoose.Types.ObjectId;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bodyType: string;
  goal: string;
  sport: string;
  activityLevel: string;
  foodPreference: string;
  availableTime: number;
  equipment: string;
  injury: string;
}

const fitnessProfileSchema = new Schema<IFitnessProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    height: {
      type: Number,
      required: true,
    },

    weight: {
      type: Number,
      required: true,
    },

    bodyType: {
      type: String,
      required: true,
      enum: ["skinny", "belly_fat", "overweight", "normal", "athletic"],
    },

    goal: {
      type: String,
      required: true,
      enum: [
        "weight_loss",
        "muscle_gain",
        "strength",
        "endurance",
        "general_fitness",
        "sport_performance",
      ],
    },

    sport: {
      type: String,
      default: "none",
    },

    activityLevel: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },

    foodPreference: {
      type: String,
      required: true,
      enum: ["veg", "non_veg", "eggetarian", "vegan"],
    },

    availableTime: {
      type: Number,
      default: 20,
    },

    equipment: {
      type: String,
      default: "none",
    },

    injury: {
      type: String,
      default: "none",
    },
  },
  {
    timestamps: true,
  },
);

export const FitnessProfile = mongoose.model<IFitnessProfile>(
  "FitnessProfile",
  fitnessProfileSchema,
);
