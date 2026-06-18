import { arePointsVisible, calculateAngle, isGoodPoint } from "./utils";

let reps = 0;
let goodReps = 0;
let badReps = 0;

let movementStage: "up" | "down" = "up";
let repHadMistake = false;
let stableDownFrames = 0;
let stableUpFrames = 0;
let lastRepTime = 0;

const MIN_VISIBILITY = 0.5;
const MIN_STABLE_FRAMES = 2;
const REP_DEBOUNCE_MS = 750;
const MIN_HORIZONTAL_BODY_SPAN = 90;
const MAX_HORIZONTAL_SLOPE = 0.55;

function pointConfidence(point: any) {
  return point?.confidence ?? point?.score ?? point?.likelihood ?? 1;
}

function isVisiblePoint(point: any) {
  return isGoodPoint(point) && pointConfidence(point) >= MIN_VISIBILITY;
}

function hasVisiblePoint(data: any, pointName: string) {
  return isVisiblePoint(data[pointName]);
}

function hasVisibleSide(data: any, side: "left" | "right") {
  const prefix = side === "left" ? "left" : "right";

  return (
    hasVisiblePoint(data, `${prefix}ShoulderPosition`) &&
    hasVisiblePoint(data, `${prefix}ElbowPosition`) &&
    hasVisiblePoint(data, `${prefix}WristPosition`) &&
    hasVisiblePoint(data, `${prefix}HipPosition`) &&
    (hasVisiblePoint(data, `${prefix}KneePosition`) ||
      hasVisiblePoint(data, `${prefix}AnklePosition`))
  );
}

function resetStableRepState() {
  movementStage = "up";
  repHadMistake = false;
  stableDownFrames = 0;
  stableUpFrames = 0;
}

function isHorizontalBodyLine(shoulder: any, hip: any, ankle: any) {
  const shoulderToAnkleX = Math.abs(ankle.x - shoulder.x);
  const shoulderToAnkleY = Math.abs(ankle.y - shoulder.y);
  const shoulderToHipY = Math.abs(hip.y - shoulder.y);
  const hipToAnkleY = Math.abs(ankle.y - hip.y);

  if (shoulderToAnkleX < MIN_HORIZONTAL_BODY_SPAN) return false;

  const fullBodySlope = shoulderToAnkleY / shoulderToAnkleX;
  const torsoSlope = shoulderToHipY / Math.max(Math.abs(hip.x - shoulder.x), 1);
  const legSlope = hipToAnkleY / Math.max(Math.abs(ankle.x - hip.x), 1);

  return (
    fullBodySlope <= MAX_HORIZONTAL_SLOPE &&
    torsoSlope <= MAX_HORIZONTAL_SLOPE &&
    legSlope <= MAX_HORIZONTAL_SLOPE
  );
}

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
      !hasVisiblePoint(data, "leftElbowPosition") ||
      !hasVisiblePoint(data, "rightElbowPosition") ||
      !hasVisiblePoint(data, "leftWristPosition") ||
      !hasVisiblePoint(data, "rightWristPosition")
    ) {
      resetStableRepState();

      return {
        wrongPart: "none",
        feedback: "Move back and show your full body.",
        stage: "waiting",
        reps,
        goodReps,
        badReps,
      };
    }

    if (!arePointsVisible(data, requiredPoints) || !requiredPoints.every((pointName) => hasVisiblePoint(data, pointName))) {
      resetStableRepState();

      return {
        wrongPart: "none",
        feedback: "Move back and show your full body.",
        stage: "waiting",
        reps,
        goodReps,
        badReps,
        debug: "Missing pushup body points",
      };
    }

    if (!hasVisibleSide(data, "left") || !hasVisibleSide(data, "right")) {
      resetStableRepState();

      return {
        wrongPart: "none",
        feedback: "Move back and show your full body.",
        stage: "waiting",
        reps,
        goodReps,
        badReps,
        debug: "Pushup requires shoulder, elbow, wrist, hip, and lower-body points",
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
    const hasHorizontalBody =
      isHorizontalBodyLine(
        data.leftShoulderPosition,
        data.leftHipPosition,
        data.leftAnklePosition,
      ) &&
      isHorizontalBodyLine(
        data.rightShoulderPosition,
        data.rightHipPosition,
        data.rightAnklePosition,
      );

    if (!hasHorizontalBody) {
      resetStableRepState();

      return {
        wrongPart: "back",
        feedback: "Move back and get into a horizontal pushup position.",
        stage: "waiting",
        reps,
        goodReps,
        badReps,
        debug: `Elbow: ${Math.round(avgElbow)} | Body: ${Math.round(avgBody)} | Not horizontal`,
      };
    }

    if (avgBody < 155) {
      wrongPart = "back";
      feedback = "Keep your body straight";
      repHadMistake = true;
    } else if (avgElbow < 45) {
      wrongPart = "arms";
      feedback = "Do not collapse too low";
      repHadMistake = true;
    }

    if (isPushupDown && wrongPart === "none") {
      stableDownFrames += 1;
      stableUpFrames = 0;

      if (movementStage === "up" && stableDownFrames >= MIN_STABLE_FRAMES) {
        movementStage = "down";
      }
    } else if (isPushupUp && wrongPart === "none") {
      stableUpFrames += 1;
      stableDownFrames = 0;
    } else {
      stableDownFrames = 0;
      stableUpFrames = 0;
    }

    if (
      isPushupUp &&
      movementStage === "down" &&
      wrongPart === "none" &&
      stableUpFrames >= MIN_STABLE_FRAMES &&
      Date.now() - lastRepTime > REP_DEBOUNCE_MS
    ) {
      reps += 1;
      lastRepTime = Date.now();

      if (repHadMistake) {
        badReps += 1;
      } else {
        goodReps += 1;
      }

      repHadMistake = false;
      movementStage = "up";
      stableUpFrames = 0;
      stableDownFrames = 0;
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
