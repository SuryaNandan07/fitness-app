from ultralytics import YOLO
import cv2
import numpy as np

import base64
# =====================================
# LOAD MODEL
# =====================================
def run(data, is_running):
    warning = "Tracking..."
    model = YOLO("yolov8s-pose.pt")

    # =====================================
    # CAMERA / VIDEO
    # =====================================

    #cap = cv2.VideoCapture("videos/How to squat correctly.webm")
    cap = cv2.VideoCapture(0)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # =====================================
    # VARIABLES
    # =====================================
    prev_person = None
    counter = 0
    stage = "up"

    UP_ANGLE = 160
    DOWN_ANGLE = 120

    GREEN = (0, 255, 0)
    RED   = (0, 0, 255)
    WHITE = (255, 255, 255)
    DARK  = (30, 30, 30)
    bottom_reached = False
    # =====================================
    # BODY CONNECTIONS
    # =====================================
    connections = [
        (5, 6),                   # shoulders
        (5, 7), (7, 9),           # left arm
        (6, 8), (8, 10),          # right arm
        (5, 11), (6, 12),         # torso
        (11, 12),                 # hips
        (11, 13), (13, 15),       # left leg
        (12, 14), (14, 16)        # right leg
    ]

    # =====================================
    # ANGLE
    # =====================================
    def calculate_angle(a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)

        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - \
                  np.arctan2(a[1]-b[1], a[0]-b[0])

        angle = abs(radians * 180 / np.pi)

        if angle > 180:
            angle = 360 - angle

        return angle

    # =====================================
    # TORSO LEAN ANGLE
    # =====================================
    def torso_angle(shoulder, hip):
        dx = shoulder[0] - hip[0]
        dy = hip[1] - shoulder[1]

        return np.degrees(np.arctan2(abs(dx), abs(dy)))

    # =====================================
    # DRAW LINE
    # =====================================
    def draw_part(img, pts, a, b, color, thickness=4):
        x1, y1 = int(pts[a][0]), int(pts[a][1])
        x2, y2 = int(pts[b][0]), int(pts[b][1])
        cv2.line(img, (x1, y1), (x2, y2), color, thickness)

    # =====================================
    # ANALYZE FORM
    # RETURNS COLORS FOR BODY PARTS
    # =====================================
    def analyze_squat(person, angle, stage):

        # Default everything green
        colors = {
            "torso": GREEN,
            "left_leg": GREEN,
            "right_leg": GREEN,
            "left_arm": GREEN,
            "right_arm": GREEN,
            "head": GREEN
        }

        warning = "Good Form"

        shoulder = person[5]
        hip = person[11]
        knee = person[13]
        ankle = person[15]

        # =================================
        # UP / RISING = ALWAYS GREEN
        # =================================
        if stage in ["up", "rising"]:
            return colors, "Nice Rep"

        # =================================
        # WRONG CHECKS ONLY WHEN DOWN
        # =================================

        # 1. HALF SQUAT
        if angle > 130:
            warning = "Go Lower"

        # 2. KNEES TOO FORWARD
        elif knee[0] > ankle[0] + 40:
            colors["left_leg"] = RED
            colors["right_leg"] = RED
            warning = "Knees Forward"

        # 3. CHEST DOWN
        elif torso_angle(shoulder, hip) > 50:
            colors["torso"] = RED
            warning = "Chest Up"

        # 4. TOO DEEP
        elif angle < 55:
            warning = "Too Deep"

        else:
            warning = "Perfect Depth"

        return colors, warning

    # =========================
# WINDOW SIZE
# =========================
    cv2.namedWindow("Squat Coach", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Squat Coach", 450, 900)
    # =====================================
    # MAIN LOOP
    # =====================================
    while is_running():
        warning = "Tracking..."

        ret, frame = cap.read()
        #frame = cv2.resize(frame, (464, 825))
        if not ret:
            break

        annotated = frame.copy()
        annotated = cv2.resize(annotated, (320, 240))

        results = model(frame, verbose=False)

        if results[0].keypoints is not None:

            pts = results[0].keypoints.xy.cpu().numpy()

            if len(pts) > 0:

                person = pts[0]

                # ==========================
                # SMOOTHING
                # ==========================
                if prev_person is None:
                    prev_person = person.copy()

                alpha = 0.7
                person = alpha * prev_person + (1 - alpha) * person
                prev_person = person.copy()
                warning = "Tracking..."
                try:
                    shoulder = person[5]
                    hip = person[11]
                    knee = person[13]
                    ankle = person[15]

                    # ======================
                    # KNEE ANGLE
                    # ======================
                    angle = calculate_angle(hip, knee, ankle)

                    # ======================
                    # STAGE LOGIC
                    # ======================
                    # Standing
                    if angle > UP_ANGLE:
                        if stage == "rising" and bottom_reached:
                            counter += 1
                            bottom_reached = False
                        stage = "up"

                    # Going down
                    elif angle < DOWN_ANGLE:
                        stage = "down"
                        bottom_reached = True

                    # Mid range coming up
                    else:
                        if stage == "down":
                            stage = "rising"

                    # ======================
                    # ANALYSIS
                    # ======================
                    colors, warning = analyze_squat(person, angle, stage)

                    # angle text
                    cv2.putText(
                        annotated,
                        str(int(angle)),
                        tuple(np.int32(knee)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        WHITE,
                        2
                    )

                except Exception as e:
                    print("Error:", e)
                    warning = "Tracking..."
                    colors = {
                        "torso": GREEN,
                        "left_leg": GREEN,
                        "right_leg": GREEN,
                        "left_arm": GREEN,
                        "right_arm": GREEN,
                        "head": GREEN
                    }
                    warning = "Tracking..."

                # =====================================
                # DRAW POINTS
                # =====================================
                for pt in person:
                    x, y = int(pt[0]), int(pt[1])
                    cv2.circle(annotated, (x, y), 5, GREEN, -1)

                # =====================================
                # DRAW HEAD
                # =====================================
                for idx in [0,1,2,3,4]:
                    x, y = int(person[idx][0]), int(person[idx][1])
                    cv2.circle(annotated, (x, y), 5, colors["head"], -1)

                # =====================================
                # DRAW ARMS
                # =====================================
                draw_part(annotated, person, 5, 7, colors["left_arm"])
                draw_part(annotated, person, 7, 9, colors["left_arm"])

                draw_part(annotated, person, 6, 8, colors["right_arm"])
                draw_part(annotated, person, 8,10, colors["right_arm"])

                # =====================================
                # DRAW TORSO
                # =====================================
                draw_part(annotated, person, 5, 6, colors["torso"])
                draw_part(annotated, person, 5,11, colors["torso"])
                draw_part(annotated, person, 6,12, colors["torso"])
                draw_part(annotated, person,11,12, colors["torso"])

                # =====================================
                # DRAW LEFT LEG
                # =====================================
                draw_part(annotated, person,11,13, colors["left_leg"])
                draw_part(annotated, person,13,15, colors["left_leg"])

                # =====================================
                # DRAW RIGHT LEG
                # =====================================
                draw_part(annotated, person,12,14, colors["right_leg"])
                draw_part(annotated, person,14,16, colors["right_leg"])

                # =====================================
                # WARNING TEXT
                # =====================================
                cv2.putText(
                    annotated,
                    warning,
                    (430, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    RED if "Forward" in warning or "Chest" in warning else GREEN,
                    2
                )

        # =====================================
        # UI PANEL
        # =====================================
        cv2.rectangle(annotated, (0,0), (320,110), DARK, -1)

        cv2.putText(
            annotated,
            f"Squats: {counter}",
            (10,40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            GREEN,
            2
        )

        cv2.putText(
            annotated,
            f"Stage: {stage}",
            (10,85),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            WHITE,
            2
        )

        # Resize final annotated frame before sending to app
        small_frame = cv2.resize(annotated, (320, 240))

        _, buffer = cv2.imencode(
            ".jpg",
            small_frame,
            [int(cv2.IMWRITE_JPEG_QUALITY), 45]
        )

        frame_base64 = base64.b64encode(buffer).decode("utf-8")

        data["frame"] = frame_base64
        data["reps"] = counter
        data["stage"] = stage
        data["feedback"] = warning


        # =====================================
        # SHOW
        # =====================================
        #cv2.imshow("Squat Coach", annotated)

        #if cv2.waitKey(1) & 0xFF == ord("q"):
        #    break

    # =====================================
    # END
    # =====================================
    cap.release()
    cv2.destroyAllWindows()