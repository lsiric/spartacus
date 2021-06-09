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

document.getElementById("station-list").addEventListener("click", (event) => {
  const stationsHtml = spa.stations
    .map((s) => {
      const isActive = spa.currentStation && s.name === spa.currentStation.name;
      return `<li class="${isActive ? "border-orange" : ""}">${s.name}</li>`;
    })
    .join("");
  var stationsPopup = new jPopup({
    content: `
      <div>
        <span>Station List: </span>
        <ol>${stationsHtml}</ol>
      </div>`,
    transition: "slideInFromBottom",
    onClose: function ($popupElement) {
      $popupElement.remove();
    },
  });

  stationsPopup.open();
});

document
  .getElementById("series-progress")
  .addEventListener("click", (event) => {
    const stationsHtml = `
      <div>Total Series: ${spa.numberOfSeries}</div>
      <div>Total Stations: ${spa.stations.length}</div>
      </br>
      <div>Current Serie: ${spa.currentSeries}</div>
      <div>Current Station: ${spa.currentStationIndex + 1}</div>
    `;
    var stationsPopup = new jPopup({
      content: `
        <div>
          ${stationsHtml}
        </div>`,
      transition: "slideInFromBottom",
      onClose: function ($popupElement) {
        $popupElement.remove();
      },
    });

    stationsPopup.open();
  });

window.onload = () => {
  "use strict";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
};
