import { CameraView, useCameraPermissions } from "expo-camera";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useState } from "react";

import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type WrongPart = "none" | "back" | "knees" | "depth";

const { width, height } = Dimensions.get("window");

export default function GuidedSquatScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [wrongPart, setWrongPart] = useState<WrongPart>("none");

    const player = useVideoPlayer(
        require("../assets/guides/squat.mp4"),
        (player) => {
            player.loop = true;
            player.muted = true;
            player.play();
        }
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            player.play();
        }, 700);

        return () => clearTimeout(timer);
    }, [player]);

    const feedback = useMemo(() => {
        if (wrongPart === "back") return "Keep your back straight";
        if (wrongPart === "knees") return "Push your knees outward";
        if (wrongPart === "depth") return "Go lower";
        return "Good posture";
    }, [wrongPart]);

    if (!permission) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>Checking camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>Camera permission is needed</Text>

                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Allow Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front" />

            <View style={styles.guideBox}>
                <VideoView
                    player={player}
                    style={styles.guideVideo}
                    contentFit="contain"
                    nativeControls={false}
                />

                <Text style={styles.guideLabel}>Follow this</Text>
            </View>

            {wrongPart === "back" && <View style={styles.backLine} />}

            {wrongPart === "knees" && (
                <>
                    <View style={styles.leftKneeCircle} />
                    <View style={styles.rightKneeCircle} />
                </>
            )}

            {wrongPart === "depth" && <View style={styles.depthLine} />}

            <View
                style={[
                    styles.feedbackBox,
                    wrongPart === "none" ? styles.goodBox : styles.badBox,
                ]}
            >
                <Text style={styles.feedbackText}>{feedback}</Text>
            </View>

            <View style={styles.testPanel}>
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => setWrongPart("none")}
                >
                    <Text style={styles.testText}>Good</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => setWrongPart("back")}
                >
                    <Text style={styles.testText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => setWrongPart("knees")}
                >
                    <Text style={styles.testText}>Knees</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => setWrongPart("depth")}
                >
                    <Text style={styles.testText}>Depth</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const LINE_WIDTH = 7;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    camera: {
        ...StyleSheet.absoluteFillObject,
    },

    center: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },

    info: {
        color: "white",
        fontSize: 18,
        marginBottom: 20,
    },

    button: {
        backgroundColor: "#22c55e",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
    },

    buttonText: {
        color: "white",
        fontWeight: "700",
    },

    guideBox: {
        position: "absolute",
        top: 45,
        right: 16,
        width: 260,
        height: 150,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "#000",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.8)",
    },

    guideVideo: {
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
    },

    guideLabel: {
        position: "absolute",
        bottom: 6,
        alignSelf: "center",
        color: "white",
        fontSize: 12,
        fontWeight: "700",
        backgroundColor: "rgba(0,0,0,0.55)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },

    feedbackBox: {
        position: "absolute",
        bottom: 115,
        alignSelf: "center",
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 18,
    },

    goodBox: {
        backgroundColor: "rgba(34,197,94,0.9)",
    },

    badBox: {
        backgroundColor: "rgba(239,68,68,0.9)",
    },

    feedbackText: {
        color: "white",
        fontSize: 18,
        fontWeight: "800",
    },

    testPanel: {
        position: "absolute",
        bottom: 35,
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    testButton: {
        backgroundColor: "rgba(0,0,0,0.65)",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },

    testText: {
        color: "white",
        fontWeight: "700",
    },

    backLine: {
        position: "absolute",
        left: width * 0.48,
        top: height * 0.27,
        width: LINE_WIDTH,
        height: height * 0.28,
        backgroundColor: "red",
        borderRadius: 999,
        transform: [{ rotate: "-15deg" }],
    },

    leftKneeCircle: {
        position: "absolute",
        left: width * 0.29,
        top: height * 0.57,
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 7,
        borderColor: "red",
    },

    rightKneeCircle: {
        position: "absolute",
        left: width * 0.57,
        top: height * 0.57,
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 7,
        borderColor: "red",
    },

    depthLine: {
        position: "absolute",
        left: width * 0.22,
        top: height * 0.62,
        width: width * 0.56,
        height: LINE_WIDTH,
        backgroundColor: "red",
        borderRadius: 999,
    },
});