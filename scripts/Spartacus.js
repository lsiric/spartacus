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

const isLastStation = (i) => i === STATION_NAMES.length - 1;

function Spartacus(
  stationDuration = STATION_DURATION,
  pauseDuration = PAUSE_DURATION,
  restDuration = REST_DURATION,
  numberOfSeries = SERIES_NUMBER
) {
  this.currentStationIndex = -1;
  this.currentStation = undefined;
  this.currentSeries = 0;
  this.isWorkoutPaused = false;
  this.isWorkoutStarted = false;

  this.isPauseInProgress = false;
  this.isRestInProgress = false;
  this.pauseCountdown = undefined;
  this.restCountdown = undefined;

  this.stations = STATION_NAMES.map((name, i) => {
    const stationWithPause = () => doStationWithPause(this.nextStation);
    const stationWithouPause = this.nextStation;
    const onDone = isLastStation(i) ? stationWithouPause : stationWithPause;
    return new Countdown(name, stationDuration, onDone);
  });

  const doStationWithPause = (afterPause = () => {}) => {
    this.isPauseInProgress = true;
    pubsub.publish(EVENTS.PAUSE_START);
    this.pauseCountdown = new Countdown("Pause", pauseDuration, () => {
      this.isPauseInProgress = false;
      afterPause();
      pubsub.publish(EVENTS.PAUSE_END);
    });
    this.pauseCountdown.start();
  };

  this.startRest = () => {
    this.isRestInProgress = true;
    pubsub.publish(EVENTS.REST_START);
    this.restCountdown = new Countdown("Rest", restDuration, () => {
      this.isRestInProgress = false;
      this.startNextSeries();
      pubsub.publish(EVENTS.REST_END);
    });
    this.restCountdown.start();
  };

  this.startCurentSeries = () => {
    this.nextStation();
    pubsub.publish(EVENTS.SERIES_START, {
      totalSeries: numberOfSeries,
      currentSeries: this.currentSeries,
    });
  };

  this.startNextSeries = () => {
    this.currentSeries++;
    this.currentStationIndex = -1;
    this.startCurentSeries();
  };

  this.nextStation = () => {
    this.currentStationIndex++;
    this.currentStation = this.stations[this.currentStationIndex];

    const nextStation = this.stations[this.currentStationIndex + 1];
    const isLastStation = this.currentStationIndex + 1 >= this.stations.length;
    const isLastSeries = this.currentSeries >= numberOfSeries;

    if (isLastStation) {
      pubsub.publish(EVENTS.SERIES_END, {
        currentSeries: this.currentSeries,
      });
      if (isLastSeries) {
        pubsub.publish(EVENTS.WORKOUT_END);
      } else {
        this.startRest();
      }
    } else {
      this.currentStation.start();
    }

    pubsub.publish(EVENTS.STATION_START, {
      totalStations: this.stations.length,
      currentStation: this.currentStationIndex + 1,
      currentStationName: this.currentStation.name,
      nextStationName: nextStation ? nextStation.name : "",
    });
  };

  this.startWorkout = () => {
    registerPubSubEvents();
    this.isWorkoutStarted = true;
    this.startNextSeries();
    pubsub.publish(EVENTS.WORKOUT_START);
  };

  this.pauseWorkout = () => {
    if (this.isPauseInProgress) this.pauseCountdown.pause();
    else if (this.isRestInProgress) this.restCountdown.pause();
    else this.currentStation.pause();
    this.isWorkoutPaused = true;
    pubsub.publish(EVENTS.WORKOUT_PAUSE);
  };

  this.resumeWorkout = () => {
    if (this.isPauseInProgress) this.pauseCountdown.resume();
    else if (this.isRestInProgress) this.restCountdown.resume();
    else this.currentStation.resume();
    this.isWorkoutPaused = false;
    pubsub.publish(EVENTS.WORKOUT_RESUME);
  };
}

export default Spartacus;
