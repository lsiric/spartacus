import { pubsub, EVENTS } from "./events.js";
import { msToSeconds, setHtml, playSound } from "./helpers.js";

const registerPubSubEvents = () => {
  let countdownInstance;

  // event handlers
  pubsub.subscribe(EVENTS.COUNTDOWN_TICK, (obj) => {
    const { remainingTime, duration } = obj;

    setHtml(".countdown-value", msToSeconds(remainingTime));
    if (remainingTime === 5000) countdownInstance = playSound("countdown");
    if (duration / remainingTime === 2)
      countdownInstance = playSound("halfTime");
    if (remainingTime <= 0) countdownInstance = null;
  });

  pubsub.subscribe(EVENTS.SERIES_START, (obj) => {
    const { totalSeries, currentSeries } = obj;
    setHtml(".total-series", totalSeries);
    setHtml(".current-series", currentSeries);
    setHtml(".current-station", 1);
  });

  pubsub.subscribe(EVENTS.WORKOUT_END, (obj) => {
    const startButton = document.getElementById("start-workout");
    const msg = "WORKOUT DONE!";
    setHtml(".station-name", msg);
    startButton.innerHTML = msg;
    startButton.setAttribute("disabled", "disabled");
  });

  pubsub.subscribe(EVENTS.STATION_START, (obj) => {
    const {
      currentStationName,
      totalStations,
      currentStation,
      nextStationName,
    } = obj;

    countdownInstance = playSound("start");

    setHtml(".station-name", `Station: \n${currentStationName}`);
    setHtml(".total-stations", totalStations);
    setHtml(".current-station", currentStation);
    setHtml(".next-station-name", nextStationName);
  });

  pubsub.subscribe(EVENTS.WORKOUT_PAUSE, () => {
    if (countdownInstance) countdownInstance.paused = true;
    playSound("pause");
  });

  pubsub.subscribe(EVENTS.WORKOUT_RESUME, () => {
    if (countdownInstance) countdownInstance.paused = false;
    playSound("pause");
  });

  // TODO: add sounds to these events
  pubsub.subscribe(EVENTS.SERIES_END, (obj) => {
    setHtml(".station-name", "Two Minutes Break!");
  });
  pubsub.subscribe(EVENTS.WORKOUT_START, (obj) => {});
  pubsub.subscribe(EVENTS.PAUSE_START, (obj) => {
    setHtml(".station-name", "Short Break!");
  });
  pubsub.subscribe(EVENTS.PAUSE_END, (obj) => {});
};

export { registerPubSubEvents };
