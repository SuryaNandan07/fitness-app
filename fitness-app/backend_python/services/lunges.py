from ultralytics import YOLO
import cv2
import numpy as np

# =====================================
# LOAD MODEL
# =====================================
model = YOLO("yolov8s-pose.pt")

# =====================================
# CAMERA / VIDEO
# =====================================
#cap = cv2.VideoCapture("videos/male-Bodyweight-forward-lunges-side.mp4")
cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# =====================================
# VARIABLES
# =====================================
prev_person = None
counter = 0
stage = "up"

UP_ANGLE = 165
DOWN_ANGLE = 105

GREEN = (0, 255, 0)
RED   = (0, 0, 255)
WHITE = (255, 255, 255)
DARK  = (30, 30, 30)

# =====================================
# HELPERS
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


def torso_angle(shoulder, hip):
    dx = shoulder[0] - hip[0]
    dy = hip[1] - shoulder[1]
    return np.degrees(np.arctan2(abs(dx), abs(dy)))


def draw_line(img, pts, a, b, color, thickness=4):
    x1, y1 = int(pts[a][0]), int(pts[a][1])
    x2, y2 = int(pts[b][0]), int(pts[b][1])
    cv2.line(img, (x1, y1), (x2, y2), color, thickness)


# =====================================
# FIND FRONT LEG
# =====================================
def get_front_leg(person):
    left_ankle = person[15]
    right_ankle = person[16]

    # bigger x = front leg in side view
    if left_ankle[0] > right_ankle[0]:
        return "left"
    else:
        return "right"


# =====================================
# ANALYZE FORM
# =====================================
def analyze_lunge(person, front_leg, knee_angle, stage):

    colors = {
        "torso": GREEN,
        "left_leg": GREEN,
        "right_leg": GREEN,
        "arms": GREEN
    }

    warning = "Good Form"

    if stage in ["up", "rising"]:
        return colors, "Ready"

    # =============================
    # FRONT LEG JOINTS
    # =============================
    if front_leg == "left":
        shoulder = person[5]
        hip = person[11]
        knee = person[13]
        ankle = person[15]
    else:
        shoulder = person[6]
        hip = person[12]
        knee = person[14]
        ankle = person[16]

    # =============================
    # BAD FORM CHECKS
    # =============================

    # not deep enough
    if knee_angle > 125:
        warning = "Go Lower"

    # knee too forward
    elif knee[0] > ankle[0] + 35:
        warning = "Front Knee Forward"
        if front_leg == "left":
            colors["left_leg"] = RED
        else:
            colors["right_leg"] = RED

    # chest leaning
    elif torso_angle(shoulder, hip) > 45:
        warning = "Chest Up"
        colors["torso"] = RED

    else:
        warning = "Perfect Lunge"

    return colors, warning


# =====================================
# MAIN LOOP
# =====================================
while True:

    ret, frame = cap.read()
    if not ret:
        break

    annotated = frame.copy()

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

            try:
                # ======================
                # FRONT LEG
                # ======================
                front_leg = get_front_leg(person)

                if front_leg == "left":
                    hip = person[11]
                    knee = person[13]
                    ankle = person[15]
                else:
                    hip = person[12]
                    knee = person[14]
                    ankle = person[16]

                # ======================
                # ANGLE
                # ======================
                angle = calculate_angle(hip, knee, ankle)

                # ======================
                # STAGE LOGIC
                # ======================
                if angle < DOWN_ANGLE:
                    stage = "down"

                elif DOWN_ANGLE <= angle < UP_ANGLE:
                    if stage == "down":
                        stage = "rising"

                elif angle >= UP_ANGLE:
                    if stage == "rising":
                        counter += 1
                    stage = "up"

                # ======================
                # ANALYZE
                # ======================
                colors, warning = analyze_lunge(
                    person, front_leg, angle, stage
                )

                cv2.putText(
                    annotated,
                    str(int(angle)),
                    tuple(np.int32(knee)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    WHITE,
                    2
                )

            except:
                colors = {
                    "torso": GREEN,
                    "left_leg": GREEN,
                    "right_leg": GREEN,
                    "arms": GREEN
                }
                warning = "Tracking..."

            # =====================================
            # DRAW POINTS
            # =====================================
            for pt in person:
                x, y = int(pt[0]), int(pt[1])
                cv2.circle(annotated, (x, y), 5, GREEN, -1)

            # =====================================
            # ARMS
            # =====================================
            draw_line(annotated, person, 5, 7, colors["arms"])
            draw_line(annotated, person, 7, 9, colors["arms"])
            draw_line(annotated, person, 6, 8, colors["arms"])
            draw_line(annotated, person, 8,10, colors["arms"])

            # =====================================
            # TORSO
            # =====================================
            draw_line(annotated, person, 5, 6, colors["torso"])
            draw_line(annotated, person, 5,11, colors["torso"])
            draw_line(annotated, person, 6,12, colors["torso"])
            draw_line(annotated, person,11,12, colors["torso"])

            # =====================================
            # LEFT LEG
            # =====================================
            draw_line(annotated, person,11,13, colors["left_leg"])
            draw_line(annotated, person,13,15, colors["left_leg"])

            # =====================================
            # RIGHT LEG
            # =====================================
            draw_line(annotated, person,12,14, colors["right_leg"])
            draw_line(annotated, person,14,16, colors["right_leg"])

            # =====================================
            # WARNING
            # =====================================
            cv2.putText(
                annotated,
                warning,
                (420, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                RED if warning not in ["Ready", "Good Form", "Perfect Lunge"] else GREEN,
                2
            )

    # =====================================
    # UI PANEL
    # =====================================
    cv2.rectangle(annotated, (0,0), (340,110), DARK, -1)

    cv2.putText(
        annotated,
        f"Lunges: {counter}",
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

    # =====================================
    # SHOW
    # =====================================
    cv2.imshow("Lunge Coach", annotated)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# =====================================
# END
# =====================================
cap.release()
cv2.destroyAllWindows()