import { pubsub, EVENTS } from "./events.js";
import { clog, msToSeconds } from "./helpers.js";

const registerPubSubEvents = () => {
  // event handlers
  pubsub.subscribe(EVENTS.COUNTDOWN_TICK_EVENT, (obj) => {
    const { name, remainingTime } = obj;

    document.querySelector(".station-name").innerHTML = name;
    document.querySelector(".countdown-value").innerHTML = msToSeconds(
      remainingTime
    );
    if (remainingTime === 5000) {
      document.getElementById("countdown-mp3").play();
    }
  });

  pubsub.subscribe(EVENTS.SERIES_START_EVENT, (obj) => {
    document.querySelector(".total-series").innerHTML = `${obj.totalSeries}`;
    document.querySelector(
      ".current-series"
    ).innerHTML = `${obj.currentSeries}`;
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
    const {
      currentStationName,
      totalStations,
      currentStation,
      nextStationName,
    } = obj;

    document.querySelector(".station-name").innerHTML = currentStationName;
    document.querySelector(".total-stations").innerHTML = totalStations;
    document.querySelector(".current-station").innerHTML = currentStation;
    document.querySelector(".next-station-name").innerHTML = nextStationName;
  });
};

export { registerPubSubEvents };
