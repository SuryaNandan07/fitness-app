import { arePointsVisible, calculateAngle } from "./utils";

let reps = 0;
let goodReps = 0;
let badReps = 0;

let movementStage: "up" | "down" = "up";
let repHadMistake = false;

export const squatExercise = {
  key: "squats",
  label: "Squats",
  video: require("../assets/guides/squat.mp4"),

  process(data: any) {
    const requiredPoints = [
      "leftShoulderPosition",
      "rightShoulderPosition",
      "leftHipPosition",
      "rightHipPosition",
      "leftKneePosition",
      "rightKneePosition",
      "leftAnklePosition",
      "rightAnklePosition",
    ];

    if (!arePointsVisible(data, requiredPoints)) {
      return {
        wrongPart: "none",
        feedback: "Show full body clearly",
        stage: "waiting",
        reps,
        goodReps,
        badReps,
        debug: "Missing squat body points",
      };
    }

    const leftKneeAngle = calculateAngle(
      data.leftHipPosition,
      data.leftKneePosition,
      data.leftAnklePosition,
    );

    const rightKneeAngle = calculateAngle(
      data.rightHipPosition,
      data.rightKneePosition,
      data.rightAnklePosition,
    );

    const leftHipAngle = calculateAngle(
      data.leftShoulderPosition,
      data.leftHipPosition,
      data.leftKneePosition,
    );

    const rightHipAngle = calculateAngle(
      data.rightShoulderPosition,
      data.rightHipPosition,
      data.rightKneePosition,
    );

    const avgKnee = (leftKneeAngle + rightKneeAngle) / 2;
    const avgHip = (leftHipAngle + rightHipAngle) / 2;

    let wrongPart: "none" | "back" | "knees" | "depth" = "none";
    let feedback = "Good squat";

    const isStanding = avgKnee > 150;
    const isSquatDown = avgKnee < 115;

    if (avgHip < 45) {
      wrongPart = "back";
      feedback = "Keep your back straight";
      repHadMistake = true;
    } else if (leftKneeAngle < 55 || rightKneeAngle < 55) {
      wrongPart = "knees";
      feedback = "Control your knees";
      repHadMistake = true;
    }

    if (isSquatDown && movementStage === "up") {
      movementStage = "down";
    }

    if (isStanding && movementStage === "down") {
      reps += 1;

      if (repHadMistake) {
        badReps += 1;
      } else {
        goodReps += 1;
      }

      repHadMistake = false;
      movementStage = "up";
    }

    if (!isSquatDown && !isStanding && wrongPart === "none") {
      wrongPart = "depth";
      feedback = "Go lower";
    }

    return {
      wrongPart,
      feedback,
      stage: movementStage,
      reps,
      goodReps,
      badReps,
      debug: `Knee: ${Math.round(avgKnee)} | Hip: ${Math.round(avgHip)} | Stage: ${movementStage}`,
    };
  },
};
