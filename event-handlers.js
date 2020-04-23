import { pubsub, EVENTS } from "./events.js";
import { clog, msToSeconds } from "./helpers.js";

// event handlers
pubsub.subscribe(EVENTS.COUNTDOWN_TICK_EVENT, (obj) => {
  document.querySelector(".station-name").innerHTML = `${obj.name}`;
  document.querySelector(".countdown-value").innerHTML = msToSeconds(
    obj.remainingTime
  );
});

pubsub.subscribe(EVENTS.SERIES_START_EVENT, (obj) => {
  document.querySelector(".total-series").innerHTML = `${obj.totalSeries}`;
  document.querySelector(".current-series").innerHTML = `${obj.currentSeries}`;
  document.querySelector(".current-station").innerHTML = `1`;
  clog(`\n*** Series: ${obj.currentSeries} START! ***`);
});

pubsub.subscribe(EVENTS.SERIES_END_EVENT, (obj) => {
  clog(`*** Series ${obj.currentSeries} DONE! ***`);
});

pubsub.subscribe(EVENTS.WORKOUT_START_EVENT, (obj) => {
  clog(`\n***********************`);
  clog(`*** WORKOUT START!! ***`);
  clog(`***********************\n`);
});

pubsub.subscribe(EVENTS.WORKOUT_DONE_EVENT, (obj) => {
  clog(`\n**********************`);
  clog(`*** WORKOUT DONE!! ***`);
  clog(`**********************\n`);
  document.querySelector(".workout-done").innerHTML = `Workout done!`;
});

pubsub.subscribe(EVENTS.STATION_START_EVENT, (obj) => {
  document.querySelector(".total-stations").innerHTML = `${obj.totalStations}`;
  document.querySelector(
    ".current-station"
  ).innerHTML = `${obj.currentStation}`;
});
