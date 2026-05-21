import express, { RequestHandler } from "express";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { FitnessProfile } from "../models/FitnessProfile";
import { WorkoutSession } from "../models/WorkoutSession";

const router = express.Router();

type FitnessProfileBody = {
  age: number;
  gender: string;
  height: number;
  weight: number;
  bodyType: string;
  goal: string;
  sport?: string;
  activityLevel: string;
  foodPreference: string;
  availableTime?: number;
  equipment?: string;
  injury?: string;
};

function getFoodRecommendations(profile: FitnessProfileBody) {
  const foods: string[] = [];

  const isMuscleGain =
    profile.goal === "muscle_gain" || profile.bodyType === "skinny";

  const isWeightLoss =
    profile.goal === "weight_loss" ||
    profile.bodyType === "belly_fat" ||
    profile.bodyType === "overweight";

  if (isMuscleGain) {
    if (profile.foodPreference === "non_veg") {
      foods.push(
        "Eggs",
        "Chicken",
        "Fish",
        "Milk",
        "Curd",
        "Rice",
        "Banana",
        "Oats",
      );
    } else if (profile.foodPreference === "eggetarian") {
      foods.push("Eggs", "Milk", "Curd", "Paneer", "Rice", "Banana", "Oats");
    } else if (profile.foodPreference === "vegan") {
      foods.push(
        "Soya chunks",
        "Tofu",
        "Dal",
        "Chana",
        "Rajma",
        "Rice",
        "Banana",
        "Peanut butter",
      );
    } else {
      foods.push(
        "Paneer",
        "Milk",
        "Curd",
        "Dal",
        "Chana",
        "Rajma",
        "Rice",
        "Banana",
      );
    }
  }

  if (isWeightLoss) {
    if (profile.foodPreference === "non_veg") {
      foods.push(
        "Egg whites",
        "Chicken breast",
        "Fish",
        "Curd",
        "Oats",
        "Vegetables",
        "Fruits",
      );
    } else if (profile.foodPreference === "eggetarian") {
      foods.push(
        "Egg whites",
        "Oats",
        "Curd",
        "Dal",
        "Sprouts",
        "Vegetables",
        "Fruits",
      );
    } else if (profile.foodPreference === "vegan") {
      foods.push(
        "Sprouts",
        "Tofu",
        "Dal",
        "Oats",
        "Vegetables",
        "Fruits",
        "Chana",
      );
    } else {
      foods.push(
        "Oats",
        "Curd",
        "Dal",
        "Sprouts",
        "Vegetables",
        "Fruits",
        "Paneer in controlled quantity",
      );
    }
  }

  if (foods.length === 0) {
    if (profile.foodPreference === "non_veg") {
      foods.push("Eggs", "Chicken", "Rice", "Curd", "Oats", "Fruits");
    } else if (profile.foodPreference === "eggetarian") {
      foods.push("Eggs", "Paneer", "Dal", "Rice", "Oats", "Fruits");
    } else if (profile.foodPreference === "vegan") {
      foods.push("Tofu", "Dal", "Chana", "Rice", "Oats", "Fruits");
    } else {
      foods.push("Paneer", "Dal", "Curd", "Rice", "Oats", "Fruits");
    }
  }

  return [...new Set(foods)];
}

function getSportExercises(sport: string) {
  const sportName = sport.toLowerCase();

  if (sportName === "cricket") {
    return ["Pushups", "Squats", "Lunges", "Plank", "Shoulder mobility"];
  }

  if (sportName === "football") {
    return ["Squats", "Lunges", "Jump squats", "Mountain climbers", "Plank"];
  }

  if (sportName === "basketball") {
    return ["Squats", "Lunges", "Calf raises", "Jump squats", "Plank"];
  }

  if (sportName === "badminton") {
    return [
      "Lunges",
      "Side lunges",
      "Plank",
      "Shoulder mobility",
      "Footwork drills",
    ];
  }

  if (sportName === "kabaddi") {
    return ["Squats", "Lunges", "Pushups", "Plank", "Burpees"];
  }

  return [];
}

function getExerciseRecommendations(
  profile: FitnessProfileBody,
  avgAccuracy: number,
) {
  const exercises: string[] = [];

  if (profile.bodyType === "skinny" || profile.goal === "muscle_gain") {
    exercises.push("Pushups", "Squats", "Lunges", "Plank");
  }

  if (
    profile.bodyType === "belly_fat" ||
    profile.bodyType === "overweight" ||
    profile.goal === "weight_loss"
  ) {
    exercises.push(
      "Squats",
      "Lunges",
      "Mountain climbers",
      "Plank",
      "Jumping jacks",
    );
  }

  if (profile.goal === "strength") {
    exercises.push("Pushups", "Squats", "Lunges", "Wall sit", "Plank");
  }

  if (profile.goal === "endurance") {
    exercises.push(
      "Jumping jacks",
      "Mountain climbers",
      "Squats",
      "Lunges",
      "Plank",
    );
  }

  if (profile.goal === "sport_performance") {
    exercises.push(...getSportExercises(profile.sport || "none"));
  }

  if (avgAccuracy < 60) {
    exercises.push("Beginner squats", "Wall pushups", "Slow lunges");
  }

  if (profile.injury === "knee") {
    return exercises.filter(
      (exercise) =>
        exercise !== "Jump squats" &&
        exercise !== "Jumping jacks" &&
        exercise !== "Mountain climbers",
    );
  }

  if (profile.injury === "wrist") {
    return exercises.filter(
      (exercise) => exercise !== "Pushups" && exercise !== "Wall pushups",
    );
  }

  if (exercises.length === 0) {
    exercises.push("Squats", "Pushups", "Lunges", "Plank");
  }

  return [...new Set(exercises)];
}

function getWeeklyPlan(exercises: string[], availableTime: number) {
  const shortPlan = availableTime <= 10;

  if (shortPlan) {
    return [
      {
        day: "Day 1",
        workout: exercises.slice(0, 3),
        sets: 2,
        note: "Short beginner-friendly session",
      },
      {
        day: "Day 2",
        workout: ["Rest", "Light walking"],
        sets: 1,
        note: "Recovery day",
      },
      {
        day: "Day 3",
        workout: exercises.slice(1, 4),
        sets: 2,
        note: "Focus on clean form",
      },
    ];
  }

  return [
    {
      day: "Day 1",
      workout: exercises.slice(0, 4),
      sets: 3,
      note: "Full body strength",
    },
    {
      day: "Day 2",
      workout: ["Walking", "Stretching", "Plank"],
      sets: 2,
      note: "Active recovery",
    },
    {
      day: "Day 3",
      workout: exercises.slice(1, 5),
      sets: 3,
      note: "Form correction workout",
    },
    {
      day: "Day 4",
      workout: ["Rest"],
      sets: 0,
      note: "Recovery",
    },
    {
      day: "Day 5",
      workout: exercises.slice(0, 5),
      sets: 3,
      note: "Progressive workout",
    },
  ];
}

function getReason(
  profile: FitnessProfileBody,
  avgAccuracy: number,
  totalWorkouts: number,
) {
  if (profile.bodyType === "skinny" || profile.goal === "muscle_gain") {
    return "Your plan focuses on strength training and protein-rich foods to support muscle gain.";
  }

  if (profile.bodyType === "belly_fat" || profile.goal === "weight_loss") {
    return "Your plan focuses on full-body workouts and lighter high-protein foods for weight loss.";
  }

  if (profile.goal === "sport_performance") {
    return `Your plan is customized for ${profile.sport || "your sport"} with strength, core, and movement-based exercises.`;
  }

  if (avgAccuracy < 60 && totalWorkouts > 0) {
    return "Your workout accuracy is low, so the plan includes easier exercises to improve form first.";
  }

  return "Your plan is balanced for general fitness, strength, and consistency.";
}

const saveProfile: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const {
      age,
      gender,
      height,
      weight,
      bodyType,
      goal,
      sport,
      activityLevel,
      foodPreference,
      availableTime,
      equipment,
      injury,
    } = req.body;

    if (
      !age ||
      !gender ||
      !height ||
      !weight ||
      !bodyType ||
      !goal ||
      !activityLevel ||
      !foodPreference
    ) {
      res.status(400).json({
        message: "Please fill all required fitness profile fields",
      });
      return;
    }

    const profile = await FitnessProfile.findOneAndUpdate(
      { userId: authReq.userId },
      {
        userId: authReq.userId,
        age,
        gender,
        height,
        weight,
        bodyType,
        goal,
        sport: sport || "none",
        activityLevel,
        foodPreference,
        availableTime: availableTime || 20,
        equipment: equipment || "none",
        injury: injury || "none",
      },
      {
        new: true,
        upsert: true,
      },
    );

    res.json({
      message: "Fitness profile saved",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save fitness profile",
      error,
    });
  }
};

const getProfile: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const profile = await FitnessProfile.findOne({
      userId: authReq.userId,
    });

    res.json({ profile });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fitness profile",
      error,
    });
  }
};

const getRecommendations: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const profile = await FitnessProfile.findOne({
      userId: authReq.userId,
    });

    if (!profile) {
      res.status(404).json({
        message:
          "Fitness profile not found. Please create your fitness profile first.",
      });
      return;
    }

    const sessions = await WorkoutSession.find({
      userId: authReq.userId,
    });

    const totalWorkouts = sessions.length;

    const totalAccuracy = sessions.reduce(
      (sum, session) => sum + (session.accuracy || 0),
      0,
    );

    const avgAccuracy =
      totalWorkouts > 0 ? Math.round(totalAccuracy / totalWorkouts) : 0;

    const profileData: FitnessProfileBody = {
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      bodyType: profile.bodyType,
      goal: profile.goal,
      sport: profile.sport,
      activityLevel: profile.activityLevel,
      foodPreference: profile.foodPreference,
      availableTime: profile.availableTime,
      equipment: profile.equipment,
      injury: profile.injury,
    };

    const exercises = getExerciseRecommendations(profileData, avgAccuracy);
    const foods = getFoodRecommendations(profileData);
    const weeklyPlan = getWeeklyPlan(exercises, profile.availableTime || 20);
    const reason = getReason(profileData, avgAccuracy, totalWorkouts);

    res.json({
      profile: profileData,
      stats: {
        totalWorkouts,
        avgAccuracy,
      },
      recommendations: {
        exercises,
        foods,
        weeklyPlan,
        reason,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate recommendations",
      error,
    });
  }
};

router.post("/profile", authMiddleware, saveProfile);
router.get("/profile", authMiddleware, getProfile);
router.get("/", authMiddleware, getRecommendations);

export default router;
