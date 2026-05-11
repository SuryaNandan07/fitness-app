import {arePointsVisible, calculateAngle } from "./utils";

export const lungeExercise = {
    key: "lunges",
    label: "Lunges",
    video: require("../assets/guides/lunge.mp4"),

    process(data: any) {
        const requiredPoints = [
            "leftHipPosition",
            "rightHipPosition",
            "leftKneePosition",
            "rightKneePosition",
            "leftAnklePosition",
            "rightAnklePosition",
            "leftShoulderPosition",
            "rightShoulderPosition",
        ];

        if (!arePointsVisible(data, requiredPoints)) {
            return {
                wrongPart: "none",
                feedback: "Show full legs clearly",
                stage: "waiting",
                debug: "Missing lunge body points",
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

        const frontKneeAngle = Math.min(leftKneeAngle, rightKneeAngle);
        const backKneeAngle = Math.max(leftKneeAngle, rightKneeAngle);
        const avgHip = (leftHipAngle + rightHipAngle) / 2;

        const debug = `LK:${leftKneeAngle.toFixed(0)} RK:${rightKneeAngle.toFixed(
            0,
        )} LH:${leftHipAngle.toFixed(0)} RH:${rightHipAngle.toFixed(0)}`;

        // Standing / reset position
        // Both knees are almost straight, so do not call it wrong.
        if (leftKneeAngle > 145 && rightKneeAngle > 145) {
            return {
                wrongPart: "none",
                feedback: "Step forward for lunge",
                stage: "ready",
                debug,
            };
        }

        // Body leaning too much
        if (avgHip < 45) {
            return {
                wrongPart: "back",
                feedback: "Keep your chest up",
                stage: "wrong",
                debug,
            };
        }

        // Front knee not bent enough
        if (frontKneeAngle > 125) {
            return {
                wrongPart: "depth",
                feedback: "Bend your front knee more",
                stage: "wrong",
                debug,
            };
        }

        // Back leg too straight during lunge
        if (backKneeAngle > 175) {
            return {
                wrongPart: "knees",
                feedback: "Lower your back knee",
                stage: "wrong",
                debug,
            };
        }

        // Too low / collapsed
        if (frontKneeAngle < 55) {
            return {
                wrongPart: "knees",
                feedback: "Do not bend too low",
                stage: "wrong",
                debug,
            };
        }

        return {
            wrongPart: "none",
            feedback: "Good lunge",
            stage: "good",
            debug,
        };
    },
};