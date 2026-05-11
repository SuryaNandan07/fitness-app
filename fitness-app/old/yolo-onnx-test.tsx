// import React, { useEffect, useState } from "react";
// import { View, Text } from "react-native";
// import * as ort from "onnxruntime-react-native";
//
// export default function YoloOnnxTest() {
//     const [status, setStatus] = useState("Loading YOLO ONNX...");
//
//     useEffect(() => {
//         async function loadModel() {
//             try {
//                 const session = await ort.InferenceSession.create(
//                     require("../assets/models/yolov8s-pose.tflite")
//                 );
//
//                 console.log("Inputs:", session.inputNames);
//                 console.log("Outputs:", session.outputNames);
//
//                 setStatus("YOLO ONNX loaded ✅");
//             } catch (error) {
//                 console.log("ONNX load error:", error);
//                 setStatus("YOLO ONNX error ❌");
//             }
//         }
//
//         loadModel();
//     }, []);
//
//     return (
//         <View style={{ flex: 1, backgroundColor: "black", alignItems: "center", justifyContent: "center" }}>
//             <Text style={{ color: "white", fontSize: 20 }}>{status}</Text>
//         </View>
//     );
// }