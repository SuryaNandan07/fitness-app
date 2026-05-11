import { squatExercise } from "./squats";
import { lungeExercise } from "./lunges";
import { pushupExercise } from "./pushups";

export const exercises: any = {
    squats: squatExercise,
    squat: squatExercise,

    lunges: lungeExercise,
    lunge: lungeExercise,

    pushups: pushupExercise,
    pushup: pushupExercise,
};