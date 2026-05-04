from fastapi import FastAPI
import threading
from services import squarts  # start with ONE exercise first

app = FastAPI()

data = {
    "reps": 0,
    "stage": "up",
    "feedback": "Ready"
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