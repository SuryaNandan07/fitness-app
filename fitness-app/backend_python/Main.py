from fastapi import FastAPI
import threading
from services import squarts  # start with ONE exercise first
from pydantic import BaseModel
import base64
import cv2
import numpy as np

app = FastAPI()
class FrameRequest(BaseModel):
    image: str
data = {
    "reps": 0,
    "stage": "up",
    "feedback": "Ready",
    "frame": ""
}

running = False
thread = None


@app.get("/start")
def start():
    global running, thread

    running = False  # stop previous
    if thread and thread.is_alive():
        thread.join(timeout=1)

    running = True
    thread = threading.Thread(target=squarts.run, args=(data, lambda: running))
    thread.start()

    return {"status": "started"}


@app.get("/stop")
def stop():
    global running
    running = False
    return {"status": "stopped"}


@app.get("/status")
def status():
    return data


@app.post("/process-frame")
def process_frame(req: FrameRequest):
    image_data = req.image.split(",")[-1]
    img_bytes = base64.b64decode(image_data)

    np_arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    result = squarts.process_frame(frame, data)

    return result