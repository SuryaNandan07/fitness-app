import { arePointsVisible, calculateAngle, isGoodPoint } from "./utils";

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
        if (!arePointsVisible(data, requiredPoints)) {
            return {
                wrongPart: "none",
                feedback: "Show arms and body clearly",
                stage: "waiting",
                debug: "Missing pushup body points",
            };
        }
        if (avgBody < 155) {
            return {
                wrongPart: "back",
                feedback: "Keep your body straight",
                stage: "wrong",
            };
        }

        if (avgElbow > 155) {
            return {
                wrongPart: "arms",
                feedback: "Go lower",
                stage: "wrong",
            };
        }

        if (avgElbow < 45) {
            return {
                wrongPart: "arms",
                feedback: "Do not collapse too low",
                stage: "wrong",
            };
        }

        return {
            wrongPart: "none",
            feedback: "Good pushup",
            stage: "good",
        };
    },
};