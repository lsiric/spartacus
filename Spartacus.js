import Countdown from "./Countdown.js";
import { pubsub, EVENTS } from "./events.js";
import { registerPubSubEvents } from "./event-handlers.js";

import {
  STATION_DURATION,
  PAUSE_DURATION,
  REST_DURATION,
  SERIES_NUMBER,
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
  stationDuration = STATION_DURATION,
  pauseDuration = PAUSE_DURATION,
  restDuration = REST_DURATION,
  numberOfSeries = SERIES_NUMBER
) {
  this.currentStationIndex = 0;
  this.currentStation = undefined;
  this.currentSeries = 0;
  this.isWorkoutPaused = false;
  this.isWorkoutStarted = false;

  this.isPauseInProgress = false;
  this.isRestInProgress = false;
  this.stations = STATION_NAMES.map((name, i) => {
    const stationWithPause = () => doStationWithPause(this.nextStation);
    const stationNoPause = this.nextStation;
    const onDone =
      i === STATION_NAMES.length - 1 ? stationNoPause : stationWithPause;
    return new Countdown(name, stationDuration, onDone);
  });

  let pauseInterval = undefined;
  let restInterval = undefined;

  this.startCurentSeries = () => {
    this.currentStation = this.stations[this.currentStationIndex];
    this.currentStation.start();
    pubsub.publish(EVENTS.SERIES_START, {
      totalSeries: numberOfSeries,
      currentSeries: this.currentSeries,
    });
  };

  this.startNextSeries = () => {
    this.isWorkoutStarted = true;
    this.currentSeries++;
    this.currentStationIndex = 0;
    this.startCurentSeries();
  };

  this.nextStation = () => {
    this.currentStationIndex++;
    this.currentStation = this.stations[this.currentStationIndex];
    const isLastStation = this.currentStationIndex >= this.stations.length;
    const isLastSeries = this.currentSeries >= numberOfSeries;

    if (isLastStation) {
      pubsub.publish(EVENTS.SERIES_END, {
        currentSeries: this.currentSeries,
      });
      if (isLastSeries) {
        pubsub.publish(EVENTS.WORKOUT_DONE);
      } else {
        doRestBetweenSeries(this.startNextSeries);
      }
    } else {
      this.publishStationStart();
      this.currentStation.start();
    }
  };

  const doRestBetweenSeries = (afterRest = () => {}) => {
    this.isRestInProgress = true;
    restInterval = new Countdown("Rest", restDuration, () => {
      this.isRestInProgress = false;
      afterRest();
    });
    restInterval.start();
  };

  const doStationWithPause = (afterPause = () => {}) => {
    this.isPauseInProgress = true;
    pauseInterval = new Countdown("Pause", pauseDuration, () => {
      this.isPauseInProgress = false;
      afterPause();
    });
    pauseInterval.start();
  };

  this.getNextStation = () => this.stations[this.currentStationIndex + 1];

  this.startWorkout = () => {
    this.startNextSeries();
    pubsub.publish(EVENTS.WORKOUT_START);
    this.publishStationStart();
  };

  this.publishStationStart = () => {
    const nextStation = this.getNextStation();
    pubsub.publish(EVENTS.STATION_START, {
      totalStations: this.stations.length,
      currentStation: this.currentStationIndex + 1,
      currentStationName: this.currentStation.name,
      nextStationName: nextStation ? nextStation.name : "",
    });
  };

  this.pauseWorkout = () => {
    if (this.isPauseInProgress) pauseInterval.pause();
    else if (this.isRestInProgress) restInterval.pause();
    else this.currentStation.pause();
    this.isWorkoutPaused = true;
    pubsub.publish(EVENTS.WORKOUT_PAUSE);
  };

  this.resumeWorkout = () => {
    if (this.isPauseInProgress) pauseInterval.resume();
    else if (this.isRestInProgress) restInterval.resume();
    else this.currentStation.resume();
    this.isWorkoutPaused = false;
    pubsub.publish(EVENTS.WORKOUT_RESUME);
  };
}

export default Spartacus;
