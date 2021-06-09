import Countdown from "./Countdown.js";
import { pubsub, EVENTS } from "./events.js";
import { registerPubSubEvents } from "./event-handlers.js";
import { STATION_NAMES } from "./config.js";

const isLastStation = (i) => i === STATION_NAMES.length - 1;

function Spartacus({
  stationDuration,
  pauseDuration,
  restDuration,
  numberOfSeries,
}) {
  this.currentStationIndex = -1;
  this.currentStation = undefined;
  this.currentSeries = 0;
  this.isWorkoutPaused = false;
  this.isWorkoutStarted = false;

  this.isPauseInProgress = false;
  this.isRestInProgress = false;
  this.pauseCountdown = undefined;
  this.restCountdown = undefined;

  this.numberOfSeries = numberOfSeries;

  pubsub.subscribe(EVENTS.STATION_END, () => {
    const isLastStation = this.currentStationIndex + 1 >= this.stations.length;
    const isLastSeries = this.currentSeries >= this.numberOfSeries;

    if (isLastStation) {
      pubsub.publish(EVENTS.SERIES_END, {
        currentSeries: this.currentSeries,
      });

      if (isLastSeries) {
        pubsub.publish(EVENTS.WORKOUT_END);
      } else {
        this.startRestBetweenSeries();
      }
    }
  });

  this.stations = STATION_NAMES.map((name, i) => {
    const stationWithPause = () => doStationWithPause(this.nextStation);
    const stationWithoutPause = () => this.nextStation();
    const onDone = isLastStation(i) ? stationWithoutPause : stationWithPause;
    return new Countdown(name, stationDuration, () => {
      pubsub.publish(EVENTS.STATION_END);
      onDone();
    });
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

  this.startRestBetweenSeries = () => {
    this.isRestInProgress = true;
    pubsub.publish(EVENTS.REST_START);
    this.restCountdown = new Countdown("Rest", restDuration, () => {
      this.isRestInProgress = false;
      this.startNextSeries();
      pubsub.publish(EVENTS.REST_END);
    });
    this.restCountdown.start();
  };

  this.startNextSeries = () => {
    this.currentSeries++;
    this.currentStationIndex = -1;

    pubsub.publish(EVENTS.SERIES_START, {
      totalSeries: this.numberOfSeries,
      currentSeries: this.currentSeries,
    });

    this.nextStation();
  };

  this.nextStation = () => {
    this.currentStationIndex++;
    this.currentStation = this.stations[this.currentStationIndex];
    const nextStation = this.stations[this.currentStationIndex + 1];

    if (this.currentStation) {
      this.currentStation.start();
      pubsub.publish(EVENTS.STATION_START, {
        totalStations: this.stations.length,
        currentStation: this.currentStationIndex + 1,
        currentStationName: this.currentStation.name,
        nextStationName: nextStation ? nextStation.name : "",
      });
    }
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
