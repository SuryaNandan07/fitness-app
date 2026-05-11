import {arePointsVisible, calculateAngle, isGoodPoint } from "./utils";

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
        if (!arePointsVisible(data, requiredPoints)) {
            return {
                wrongPart: "none",
                feedback: "Show full body clearly",
                stage: "waiting",
                debug: "Missing squat body points",
            };
        }
        if (avgHip < 45) {
            return {
                wrongPart: "back",
                feedback: "Keep your back straight",
                stage: "wrong",
            };
        }

        if (avgKnee > 165) {
            return {
                wrongPart: "depth",
                feedback: "Go lower",
                stage: "wrong",
            };
        }

        if (leftKneeAngle < 55 || rightKneeAngle < 55) {
            return {
                wrongPart: "knees",
                feedback: "Control your knees",
                stage: "wrong",
            };
        }

        return {
            wrongPart: "none",
            feedback: "Good squat",
            stage: "good",
        };
    },
};