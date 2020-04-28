import { pubsub, EVENTS } from "./events.js";
import { clog, msToSeconds, setHtml } from "./helpers.js";

const registerPubSubEvents = () => {
  // event handlers
  pubsub.subscribe(EVENTS.COUNTDOWN_TICK_EVENT, (obj) => {
    const { name, remainingTime } = obj;

    setHtml(".station-name", name);
    setHtml(".countdown-value", msToSeconds(remainingTime));
    if (remainingTime === 5000) {
      document.getElementById("countdown-mp3").play();
    }
  });

  pubsub.subscribe(EVENTS.SERIES_START_EVENT, (obj) => {
    const { totalSeries, currentSeries } = obj;
    setHtml(".total-series", totalSeries);
    setHtml(".current-series", currentSeries);
    setHtml(".current-station", 1);
    clog(`\n*** Series: ${currentSeries} START! ***`);
  });

  pubsub.subscribe(EVENTS.SERIES_END_EVENT, (obj) => {
    const { currentSeries } = obj;
    clog(`*** Series ${currentSeries} DONE! ***`);
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

    const startButton = document.getElementById("start-workout");

    startButton.innerHTML = "Workout done!";
    startButton.setAttribute("disabled", "disabled");
  });

  pubsub.subscribe(EVENTS.STATION_START_EVENT, (obj) => {
    const {
      currentStationName,
      totalStations,
      currentStation,
      nextStationName,
    } = obj;

    setHtml(".station-name", currentStationName);
    setHtml(".total-stations", totalStations);
    setHtml(".current-station", currentStation);
    clog(`nextStationName: ${nextStationName}`);
    setHtml(".next-station-name", nextStationName);
  });
};

export { registerPubSubEvents };
