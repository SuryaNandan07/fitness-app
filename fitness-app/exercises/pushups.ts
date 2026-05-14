import { arePointsVisible, calculateAngle, isGoodPoint } from "./utils";

let reps = 0;
let goodReps = 0;
let badReps = 0;

let movementStage: "up" | "down" = "up";
let repHadMistake = false;

export const pushupExercise = {
  key: "pushups",
  label: "Pushups",
  video: require("../assets/guides/pushup.mp4"),

  process(data: any) {
    const requiredPoints = [
      "leftShoulderPosition",
      "rightShoulderPosition",
      "leftElbowPosition",
      "rightElbowPosition",
      "leftWristPosition",
      "rightWristPosition",
      "leftHipPosition",
      "rightHipPosition",
      "leftAnklePosition",
      "rightAnklePosition",
    ];

    if (
      !isGoodPoint(data.leftElbowPosition) ||
      !isGoodPoint(data.rightElbowPosition) ||
      !isGoodPoint(data.leftWristPosition) ||
      !isGoodPoint(data.rightWristPosition)
    ) {
      return {
        wrongPart: "none",
        feedback: "Show full upper body",
        stage: "waiting",
        reps,
        goodReps,
        badReps,
      };
    }

    if (!arePointsVisible(data, requiredPoints)) {
      return {
        wrongPart: "none",
        feedback: "Show arms and body clearly",
        stage: "waiting",
        reps,
        goodReps,
        badReps,
        debug: "Missing pushup body points",
      };
    }

    const leftElbowAngle = calculateAngle(
      data.leftShoulderPosition,
      data.leftElbowPosition,
      data.leftWristPosition,
    );

    const rightElbowAngle = calculateAngle(
      data.rightShoulderPosition,
      data.rightElbowPosition,
      data.rightWristPosition,
    );

    const leftBodyAngle = calculateAngle(
      data.leftShoulderPosition,
      data.leftHipPosition,
      data.leftAnklePosition,
    );

    const rightBodyAngle = calculateAngle(
      data.rightShoulderPosition,
      data.rightHipPosition,
      data.rightAnklePosition,
    );

    const avgElbow = (leftElbowAngle + rightElbowAngle) / 2;
    const avgBody = (leftBodyAngle + rightBodyAngle) / 2;

    let wrongPart: "none" | "back" | "arms" = "none";
    let feedback = "Good pushup";

    const isPushupUp = avgElbow > 150;
    const isPushupDown = avgElbow < 90;

    if (avgBody < 155) {
      wrongPart = "back";
      feedback = "Keep your body straight";
      repHadMistake = true;
    } else if (avgElbow < 45) {
      wrongPart = "arms";
      feedback = "Do not collapse too low";
      repHadMistake = true;
    }

    if (isPushupDown && movementStage === "up") {
      movementStage = "down";
    }

    if (isPushupUp && movementStage === "down") {
      reps += 1;

      if (repHadMistake) {
        badReps += 1;
      } else {
        goodReps += 1;
      }

      repHadMistake = false;
      movementStage = "up";
    }

    if (!isPushupDown && !isPushupUp && wrongPart === "none") {
      wrongPart = "arms";
      feedback = "Go lower";
    }

    return {
      wrongPart,
      feedback,
      stage: movementStage,
      reps,
      goodReps,
      badReps,
      debug: `Elbow: ${Math.round(avgElbow)} | Body: ${Math.round(avgBody)} | Stage: ${movementStage}`,
    };
  },
};
