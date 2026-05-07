// import { Dimensions } from "react-native";
// import Svg, { Circle, Line } from "react-native-svg";
// import React, { useMemo, useState } from "react";
// import { StyleSheet, Text, View } from "react-native";
// import {
//     Camera,
//     useCameraDevice,
//     useCameraPermission,
//     useFrameProcessor,
//     runAtTargetFps,
// } from "react-native-vision-camera";
// import { useTensorflowModel } from "react-native-fast-tflite";
// import { NitroModules } from "react-native-nitro-modules";
// import { useResizePlugin } from "vision-camera-resize-plugin";
// import { Worklets } from "react-native-worklets-core";
// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
//
//
// export default function MoveNetTest() {
//     const device = useCameraDevice("front");
//     const { hasPermission, requestPermission } = useCameraPermission();
//     const [keypoints, setKeypoints] = useState<any[]>([]);
//
//     const [status, setStatus] = useState("Loading MoveNet...");
//     const [outputText, setOutputText] = useState("");
//
//     const movenet = useTensorflowModel(
//         require("../assets/models/yolov8s-pose.tflite"),
//         []
//     );
//
//     const model = movenet.state === "loaded" ? movenet.model : undefined;
//
//     const boxedModel = useMemo(
//         () => (model != null ? NitroModules.box(model) : undefined),
//         [model]
//     );
//
//     const { resize } = useResizePlugin();
//
//     const updateOutput = Worklets.createRunOnJS((text: string) => {
//         setStatus("MoveNet running ✅");
//         setOutputText(text);
//     });
//     const updateKeypoints = Worklets.createRunOnJS((points: any[]) => {
//         setKeypoints(points);
//     });
//
//     React.useEffect(() => {
//         if (!hasPermission) requestPermission();
//     }, [hasPermission]);
//
//     React.useEffect(() => {
//         if (movenet.state === "loading") setStatus("Loading MoveNet...");
//         if (movenet.state === "error") setStatus("MoveNet model error ❌");
//         if (movenet.state === "loaded") setStatus("MoveNet loaded ✅");
//     }, [movenet.state]);
//
//     const frameProcessor = useFrameProcessor(
//         (frame) => {
//             "worklet";
//
//             if (boxedModel == null) return;
//
//             runAtTargetFps(10, () => {
//                 "worklet";
//
//                 const tflite = boxedModel.unbox();
//
//                 const resized = resize(frame, {
//                     scale: {
//                         width: 192,
//                         height: 192,
//                     },
//                     pixelFormat: "rgb",
//                     dataType: "uint8",
//                 }) as unknown as Uint8Array;
//
//                 const outputs = tflite.runSync([resized.buffer as ArrayBuffer]);
//
//                 const firstOutput = new Float32Array(outputs[0] as ArrayBuffer);
//
//                 const raw = new Float32Array(outputs[0] as ArrayBuffer);
//                 const points = [];
//
//                 for (let i = 0; i < 17; i++) {
//                     points.push({
//                         y: raw[i * 3],
//                         x: raw[i * 3 + 1],
//                         score: raw[i * 3 + 2],
//                     });
//                 }
//
//                 updateKeypoints(points);
//
//                 const noseY = raw[0];
//                 const noseX = raw[1];
//                 const noseScore = raw[2];
//
//                 updateOutput(
//                 `Output length: ${raw.length}
//                 Nose X: ${noseX.toFixed(2)}
//                 Nose Y: ${noseY.toFixed(2)}
//                 Score: ${noseScore.toFixed(2)}`
//                 );
//             });
//         },
//         [boxedModel]
//     );
//
//     if (!hasPermission) {
//         return (
//             <View style={styles.center}>
//                 <Text style={styles.text}>Camera permission needed</Text>
//             </View>
//         );
//     }
//
//     if (!device) {
//         return (
//             <View style={styles.center}>
//                 <Text style={styles.text}>No camera found</Text>
//             </View>
//         );
//     }
//     const edges = [
//         [5, 6],
//         [5, 7],
//         [7, 9],
//         [6, 8],
//         [8, 10],
//         [5, 11],
//         [6, 12],
//         [11, 12],
//         [11, 13],
//         [13, 15],
//         [12, 14],
//         [14, 16],
//     ];
//     return (
//         <View style={styles.container}>
//             <Camera
//                 style={StyleSheet.absoluteFill}
//                 device={device}
//                 isActive={true}
//                 frameProcessor={frameProcessor}
//             />
//
//             <Svg style={StyleSheet.absoluteFill}>
//                 {edges.map(([a, b], index) => {
//                     const p1 = keypoints[a];
//                     const p2 = keypoints[b];
//
//                     if (!p1 || !p2) return null;
//                     if (p1.score <= 0.4 || p2.score <= 0.4) return null;
//
//                     const x1 =
//                         device.position === "front"
//                             ? SCREEN_WIDTH - p1.x * SCREEN_WIDTH
//                             : p1.x * SCREEN_WIDTH;
//
//                     const x2 =
//                         device.position === "front"
//                             ? SCREEN_WIDTH - p2.x * SCREEN_WIDTH
//                             : p2.x * SCREEN_WIDTH;
//
//                     return (
//                         <Line
//                             key={`line-${index}`}
//                             x1={x1}
//                             y1={p1.y * SCREEN_HEIGHT}
//                             x2={x2}
//                             y2={p2.y * SCREEN_HEIGHT}
//                             stroke="#22c55e"
//                             strokeWidth="4"
//                         />
//                     );
//                 })}
//
//                 {keypoints.map((p, index) => {
//                     if (p.score <= 0.4) return null;
//
//                     const drawX =
//                         device.position === "front"
//                             ? SCREEN_WIDTH - p.x * SCREEN_WIDTH
//                             : p.x * SCREEN_WIDTH;
//
//                     return (
//                         <Circle
//                             key={`point-${index}`}
//                             cx={drawX}
//                             cy={p.y * SCREEN_HEIGHT}
//                             r="6"
//                             fill="#22c55e"
//                         />
//                     );
//                 })}
//             </Svg>
//
//             <View style={styles.overlay}>
//                 <Text style={styles.title}>{status}</Text>
//                 <Text style={styles.text}>{outputText}</Text>
//             </View>
//         </View>
//     );
// }
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "black",
//     },
//     center: {
//         flex: 1,
//         backgroundColor: "black",
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     overlay: {
//         position: "absolute",
//         top: 60,
//         left: 20,
//         right: 20,
//         padding: 12,
//         borderRadius: 12,
//         backgroundColor: "rgba(0,0,0,0.65)",
//     },
//     title: {
//         color: "#22c55e",
//         fontSize: 20,
//         fontWeight: "bold",
//         marginBottom: 8,
//     },
//     text: {
//         color: "white",
//         fontSize: 14,
//     },
// });