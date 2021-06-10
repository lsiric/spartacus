import Spartacus from "./Spartacus.js";
import { defaultParams } from "./config.js";
import { setHtml } from "./helpers.js";

let spa = new Spartacus(defaultParams);

setHtml(".station-name", defaultParams.name);
setHtml(".total-series", spa.numberOfSeries);
setHtml(".total-stations", spa.stations.length);
setHtml(".current-series", 0);
setHtml(".current-station", 0);

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

document
  .getElementById("station-list-btn")
  .addEventListener("click", (event) => {
    const stationsHtml = spa.stations
      .map((s, i) => {
        const isActive =
          spa.currentStation && s.name === spa.currentStation.name;
        return `        
        <div class="row">
          <div class="col-sm-12 mt1 mb1 pb1 station-name">
            ${i + 1}. ${s.name}
          </div>
          <div class="col-sm-offset-1 col-sm-10 mb2 text-center ${
            isActive ? "orange" : ""
          }">
            <img class="img" src="./assets/images/${i + 1}.png">
          </div>
        </div>
        `;
      })
      .join("");

    const popupContent = `
    <div class="content station-list">
      <div class="row">
        <div class="col-sm-12 pt1 pb1">
          <span>Station List: </span>
        </div>
      </div>
      ${stationsHtml}
    </div>`;

    var stationsPopup = new jPopup({
      content: popupContent,
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
