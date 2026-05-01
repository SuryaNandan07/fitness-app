from fastapi import FastAPI

app = FastAPI()

@app.get("/exercises")
def get_exercises():
    return ["Pushup", "Squat", "Plank"]

@app.get("/")
def home():
    return {"message": "Backend running"}