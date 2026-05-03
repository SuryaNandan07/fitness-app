import cv2
from ultralytics import YOLO
import math

# ----------------------------
# LOAD MODEL
# ----------------------------
model = YOLO("yolov8s-pose.pt")

# VIDEO / CAMERA
cap = cv2.VideoCapture("videos/male-Bodyweight-push-up-side.mp4")
#cap = cv2.VideoCapture(1)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# ----------------------------
# VARIABLES
# ----------------------------
count = 0
stage = "UP"

good_reps = 0
bad_reps = 0

raise_hips_count = 0
go_lower_count = 0

depth_ok = False
body_ok = True
rep_good = True

prev_person = None

# ----------------------------
# ANGLE FUNCTION
# ----------------------------
def angle(a, b, c):
    ax, ay = a
    bx, by = b
    cx, cy = c

    ab = (ax - bx, ay - by)
    cb = (cx - bx, cy - by)

    dot = ab[0] * cb[0] + ab[1] * cb[1]

    mag1 = math.sqrt(ab[0] ** 2 + ab[1] ** 2)
    mag2 = math.sqrt(cb[0] ** 2 + cb[1] ** 2)

    if mag1 == 0 or mag2 == 0:
        return 0

    cosang = dot / (mag1 * mag2)
    cosang = max(-1, min(1, cosang))

    ang = math.degrees(math.acos(cosang))
    return ang


# ----------------------------
# MAIN LOOP
# ----------------------------
while True:
    ret, frame = cap.read()

    if not ret:
        break

    results = model(frame, verbose=False)
    annotated = frame.copy()

    feedback = "Detecting..."
    feedback_color = (0, 255, 255)

    if results[0].keypoints is not None:
        pts = results[0].keypoints.xy.cpu().numpy()

        if len(pts) > 0:
            person = pts[0]

            # ----------------------------
            # SMOOTHING
            # ----------------------------
            if prev_person is None:
                prev_person = person.copy()

            alpha = 0.7
            person = alpha * prev_person + (1 - alpha) * person
            prev_person = person.copy()

            # ----------------------------
            # DRAW GREEN POINTS
            # ----------------------------
            for pt in person:
                x, y = int(pt[0]), int(pt[1])
                cv2.circle(annotated, (x, y), 6, (0, 255, 0), -1)

            # ----------------------------
            # DRAW GREEN SKELETON
            # ----------------------------
            connections = [
                (5, 7), (7, 9),
                (6, 8), (8, 10),
                (5, 6),
                (5, 11), (6, 12),
                (11, 12),
                (11, 13), (13, 15),
                (12, 14), (14, 16)
            ]

            for a, b in connections:
                x1, y1 = int(person[a][0]), int(person[a][1])
                x2, y2 = int(person[b][0]), int(person[b][1])

                cv2.line(annotated, (x1, y1), (x2, y2), (0, 255, 0), 3)

            # ----------------------------
            # RIGHT SIDE POINTS
            # ----------------------------
            shoulder = person[6]
            elbow = person[8]
            wrist = person[10]
            hip = person[12]
            ankle = person[16]

            # ----------------------------
            # ANGLES
            # ----------------------------
            elbow_angle = angle(shoulder, elbow, wrist)
            body_angle = angle(shoulder, hip, ankle)

            # ----------------------------
            # RESET CURRENT REP STATUS
            # ----------------------------
            if stage == "UP":
                rep_good = True

            feedback = "Good Form"
            feedback_color = (0, 255, 0)

            # ----------------------------
            # BODY CHECK
            # ----------------------------
            if body_angle < 155:
                feedback = "Raise Hips"
                feedback_color = (0, 0, 255)
                body_ok = False
                rep_good = False
                raise_hips_count += 1

                cv2.circle(
                    annotated,
                    (int(hip[0]), int(hip[1])),
                    10,
                    (0, 0, 255),
                    -1
                )
                cv2.line(annotated,
                         (int(shoulder[0]), int(shoulder[1])),
                         (int(hip[0]), int(hip[1])),
                         (0, 0, 255), 4)

                cv2.line(annotated,
                         (int(hip[0]), int(hip[1])),
                         (int(ankle[0]), int(ankle[1])),
                         (0, 0, 255), 4)
            else:
                body_ok = True

            # ----------------------------
            # GO DOWN
            # ----------------------------
            if elbow_angle < 95:
                stage = "DOWN"
                depth_ok = True

            # ----------------------------
            # SHALLOW PUSHUP
            # ----------------------------
            elif stage == "DOWN" and not depth_ok and 110 < elbow_angle < 145:
                feedback = "Go Lower"
                feedback_color = (0, 0, 255)

                rep_good = False
                go_lower_count += 1

                cv2.circle(
                    annotated,
                    (int(elbow[0]), int(elbow[1])),
                    10,
                    (0, 0, 255),
                    -1
                )
                cv2.line(annotated,
                         (int(shoulder[0]), int(shoulder[1])),
                         (int(elbow[0]), int(elbow[1])),
                         (0, 0, 255), 4)

                cv2.line(annotated,
                         (int(elbow[0]), int(elbow[1])),
                         (int(wrist[0]), int(wrist[1])),
                         (0, 0, 255), 4)

            # ----------------------------
            # COME UP = REP COMPLETE
            # ----------------------------
            elif elbow_angle > 155 and stage == "DOWN":

                if depth_ok and body_ok:
                    count += 1

                    if rep_good:
                        good_reps += 1
                    else:
                        bad_reps += 1

                else:
                    bad_reps += 1

                stage = "UP"
                depth_ok = False

            # ----------------------------
            # DISPLAY ANGLES
            # ----------------------------
            cv2.putText(
                annotated,
                f"Elbow: {int(elbow_angle)}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2
            )

            cv2.putText(
                annotated,
                f"Body: {int(body_angle)}",
                (20, 75),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2
            )

    # ----------------------------
    # SUMMARY
    # ----------------------------
    total = good_reps + bad_reps

    if total > 0:
        accuracy = int((good_reps / total) * 100)
    else:
        accuracy = 0

    issue = "None"

    if raise_hips_count > go_lower_count and raise_hips_count > 0:
        issue = "Raise Hips"
    elif go_lower_count > 0:
        issue = "Go Lower"

    # ----------------------------
    # DISPLAY TEXT
    # ----------------------------
    cv2.putText(
        annotated,
        f"Pushups: {count}",
        (20, 115),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (0, 255, 0),
        2
    )

    cv2.putText(
        annotated,
        f"Stage: {stage}",
        (20, 150),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (0, 255, 0),
        2
    )

    cv2.putText(
        annotated,
        feedback,
        (20, 190),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        feedback_color,
        2
    )

    cv2.putText(
        annotated,
        f"Good: {good_reps}",
        (20, 230),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.putText(
        annotated,
        f"Bad: {bad_reps}",
        (20, 265),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 0, 255),
        2
    )

    cv2.putText(
        annotated,
        f"Accuracy: {accuracy}%",
        (20, 300),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2
    )

    cv2.putText(
        annotated,
        f"Issue: {issue}",
        (20, 335),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2
    )

    # ----------------------------
    # SHOW
    # ----------------------------
    cv2.imshow("Pushup Coach", annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ----------------------------
# CLOSE
# ----------------------------
cap.release()
cv2.destroyAllWindows()