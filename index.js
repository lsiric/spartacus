import Spartacus from "./Spartacus.js";
let spa = new Spartacus();

document.getElementById("start-workout").addEventListener("click", (event) => {
  if (!spa.isWorkoutStarted) {
    spa.startWorkout();
    event.target.textContent = "PAUSE WORKOUT";
  } else if (spa.isWorkoutPaused) {
    spa.resumeWorkout();
    event.target.textContent = "PAUSE WORKOUT";
  } else {
    spa.pauseWorkout();
    event.target.textContent = "RESUME WORKOUT";
  }
});
