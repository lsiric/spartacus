import Countdown from "./Countdown.js";
import { pubsub, EVENTS } from "./events.js";
import { registerPubSubEvents } from "./event-handlers.js";

import {
  DEFAULT_STATION_DURATION,
  DEFAULT_PAUSE_DURATION,
  DEFAULT_REST_DURATION,
  DEFAULT_SERIES_NUMBER,
  STATION_NAMES,
} from "./config.js";

// wrapping all pubsub handlers into a "user gesture"
// workaround because of this : https://stackoverflow.com/questions/38791760/domexception-play-can-only-be-initiated-by-a-user-gesture#38791871
function registerEvents() {
  //do some stuff here
  console.log("registered");
  registerPubSubEvents();
  document.removeEventListener("mousemove", registerEvents, false);
}
document.addEventListener("mousemove", registerEvents, false);

function Spartacus(
  stationDuration = DEFAULT_STATION_DURATION,
  pauseDuration = DEFAULT_PAUSE_DURATION,
  restDuration = DEFAULT_REST_DURATION,
  numberOfSeries = DEFAULT_SERIES_NUMBER
) {
  this.stations = [];
  this.currentStationIndex = 0;
  this.currentStation = undefined;
  this.currentSeries = 0;
  this.isWorkoutPaused = false;
  this.isWorkoutStarted = false;

  let isPauseInProgress = false;
  let pauseCountdown = undefined;
  let isRestInProgress = false;
  let restCountdown = undefined;

  const isLastStation = () => this.currentStationIndex >= this.stations.length;
  const isLastSeries = () => this.currentSeries >= numberOfSeries;

  this.startCurentSeries = () => {
    this.currentStation = this.stations[this.currentStationIndex];
    this.currentStation.start();
    pubsub.publish(EVENTS.SERIES_START, {
      totalSeries: numberOfSeries,
      currentSeries: this.currentSeries,
    });
  };

  this.startNextSeries = () => {
    this.currentSeries++;
    this.currentStationIndex = 0;
    this.startCurentSeries();
  };

  this.nextStation = () => {
    this.currentStationIndex++;
    this.currentStation = this.stations[this.currentStationIndex];

    if (isLastStation()) {
      pubsub.publish(EVENTS.SERIES_END, {
        currentSeries: this.currentSeries,
      });
      if (isLastSeries()) {
        pubsub.publish(EVENTS.WORKOUT_DONE);
      } else {
        doRestBetweenSeries(this.startNextSeries);
      }
    } else {
      const nextStation = this.stations[this.currentStationIndex + 1];
      pubsub.publish(EVENTS.STATION_START, {
        totalStations: this.stations.length,
        currentStation: this.currentStationIndex + 1,
        currentStationName: this.currentStation.name,
        nextStationName: nextStation ? nextStation.name : "",
      });
      this.currentStation.start();
    }
  };

  const doRestBetweenSeries = (afterRest = () => {}) => {
    isRestInProgress = true;
    restCountdown = new Countdown("Rest", restDuration, () => {
      isRestInProgress = false;
      afterRest();
    });
    restCountdown.start();
  };

  const doPauseBetweenStations = (afterPause = () => {}) => {
    isPauseInProgress = true;
    pauseCountdown = new Countdown("Pause", pauseDuration, () => {
      isPauseInProgress = false;
      afterPause();
    });
    pauseCountdown.start();
  };

  const mapStations = () => {
    const isLastStation = (i) => i === STATION_NAMES.length - 1;

    STATION_NAMES.forEach((name, i) => {
      const nextStationWithPause = () =>
        doPauseBetweenStations(this.nextStation);
      const nextStationNoPause = this.nextStation;
      // if last station, don't do pause afterwards
      const onDone = isLastStation(i)
        ? nextStationNoPause
        : nextStationWithPause;
      const station = new Countdown(name, stationDuration, onDone);
      this.stations.push(station);
    });
  };

  this.startWorkout = () => {
    mapStations();
    this.startNextSeries();
    this.isWorkoutStarted = true;
    const nextStation = this.stations[this.currentStationIndex + 1];
    pubsub.publish(EVENTS.WORKOUT_START);
    pubsub.publish(EVENTS.STATION_START, {
      totalStations: this.stations.length,
      currentStation: this.currentStationIndex + 1,
      currentStationName: this.currentStation.name,
      nextStationName: nextStation ? nextStation.name : "",
    });
  };

  this.pauseWorkout = () => {
    if (isPauseInProgress) pauseCountdown.pause();
    else if (isRestInProgress) restCountdown.pause();
    else this.currentStation.pause();
    this.isWorkoutPaused = true;
    pubsub.publish(EVENTS.WORKOUT_PAUSE);
  };

  this.resumeWorkout = () => {
    if (isPauseInProgress) pauseCountdown.resume();
    else if (isRestInProgress) restCountdown.resume();
    else this.currentStation.resume();
    this.isWorkoutPaused = false;
    pubsub.publish(EVENTS.WORKOUT_RESUME);
  };
}

export default Spartacus;
