import Spartacus from "./Spartacus.js";
import { defaultParams } from "./config.js";
import { setHtml } from "./helpers.js";
setHtml(".station-name", defaultParams.name);
let spa = new Spartacus(defaultParams);

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

window.onload = () => {
  "use strict";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
};
