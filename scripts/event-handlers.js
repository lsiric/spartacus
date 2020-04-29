import { pubsub, EVENTS } from "./events.js";
import { msToSeconds, setHtml, playSound } from "./helpers.js";

const registerPubSubEvents = () => {
  let countdownInstance;

  // event handlers
  pubsub.subscribe(EVENTS.COUNTDOWN_TICK, (obj) => {
    const { name, remainingTime } = obj;

    setHtml(".station-name", name);
    setHtml(".countdown-value", msToSeconds(remainingTime));
    if (remainingTime === 5000) countdownInstance = playSound("countdown");
    if (remainingTime <= 0) countdownInstance = null;
  });

  pubsub.subscribe(EVENTS.SERIES_START, (obj) => {
    const { totalSeries, currentSeries } = obj;
    setHtml(".total-series", totalSeries);
    setHtml(".current-series", currentSeries);
    setHtml(".current-station", 1);
  });

  pubsub.subscribe(EVENTS.WORKOUT_DONE, (obj) => {
    const startButton = document.getElementById("start-workout");

    startButton.innerHTML = "Workout done!";
    startButton.setAttribute("disabled", "disabled");
  });

  pubsub.subscribe(EVENTS.STATION_START, (obj) => {
    const {
      currentStationName,
      totalStations,
      currentStation,
      nextStationName,
    } = obj;

    setHtml(".station-name", currentStationName);
    setHtml(".total-stations", totalStations);
    setHtml(".current-station", currentStation);
    setHtml(".next-station-name", nextStationName);

    document
      .querySelector(".station-image")
      .setAttribute("src", `assets/images/${currentStation}.png`);
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
  pubsub.subscribe(EVENTS.SERIES_END, (obj) => {});
  pubsub.subscribe(EVENTS.WORKOUT_START, (obj) => {});
  pubsub.subscribe(EVENTS.PAUSE_START, (obj) => {});
  pubsub.subscribe(EVENTS.PAUSE_DONE, (obj) => {});
};

export { registerPubSubEvents };
