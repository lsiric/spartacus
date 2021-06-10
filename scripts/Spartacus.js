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
  this.stationDuration = stationDuration;
  this.pauseDuration = pauseDuration;
  this.restDuration = restDuration;
  this.numberOfSeries = numberOfSeries;

  this.currentStationIndex = -1;
  this.currentStation = undefined;
  this.currentSeries = 0;
  this.isWorkoutPaused = false;
  this.isWorkoutStarted = false;

  this.isPauseInProgress = false;
  this.isRestInProgress = false;
  this.pauseCountdown = undefined;
  this.restCountdown = undefined;

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
    return new Countdown(name, this.stationDuration, () => {
      pubsub.publish(EVENTS.STATION_END, this.getRemaining());
      onDone();
    });
  });

  const doStationWithPause = (afterPause = () => {}) => {
    this.isPauseInProgress = true;
    pubsub.publish(EVENTS.PAUSE_START);
    this.pauseCountdown = new Countdown("Pause", this.pauseDuration, () => {
      this.isPauseInProgress = false;
      afterPause();
      pubsub.publish(EVENTS.PAUSE_END);
    });
    this.pauseCountdown.start();
  };

  this.startRestBetweenSeries = () => {
    this.isRestInProgress = true;
    pubsub.publish(EVENTS.REST_START);
    this.restCountdown = new Countdown("Rest", this.restDuration, () => {
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
    pubsub.publish(EVENTS.WORKOUT_START, this.getRemaining());
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

  this.getRemaining = () => {
    const remaining = [];

    for (let a = this.currentSeries; a < this.numberOfSeries; a++) {
      for (
        let b = this.currentStationIndex + 1;
        b < this.stations.length;
        b++
      ) {
        const s = this.stations[b];
        remaining.push({
          name: s.name,
          duration: this.stationDuration / 1000,
        });
        if (b < this.stations.length - 1) {
          remaining.push({
            name: "Pause",
            duration: this.pauseDuration / 1000,
          });
        }
      }
      if (a < this.numberOfSeries - 1) {
        remaining.push({
          name: "Rest",
          duration: this.restDuration / 1000,
        });
      }
    }

    return remaining;
  };
}

export default Spartacus;
