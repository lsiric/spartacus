import Countdown from "./Countdown.js";
import { pubsub, EVENTS } from "./events.js";
import {
  DEFAULT_STATION_DURATION,
  DEFAULT_PAUSE_DURATION,
  DEFAULT_REST_DURATION,
  DEFAULT_SERIES_NUMBER,
  STATION_NAMES,
} from "./config.js";

// let startAudio = new Audio("audio/boxing-bell.mp3");
// startAudio.play();

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

  let isPauseInProgress = false;
  let pauseCountdown = undefined;
  let isRestInProgress = false;
  let restCountdown = undefined;

  const isLastStation = () => this.currentStationIndex >= this.stations.length;
  const isLastSeries = () => this.currentSeries >= numberOfSeries;

  this.startCurentSeries = () => {
    this.currentStation = this.stations[this.currentStationIndex];
    this.currentStation.start();
    pubsub.publish(EVENTS.SERIES_START_EVENT, {
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

    if (isLastStation()) {
      pubsub.publish(EVENTS.SERIES_END_EVENT, {
        currentSeries: this.currentSeries,
      });
      if (isLastSeries()) {
        pubsub.publish(EVENTS.WORKOUT_DONE_EVENT);
      } else {
        doRestBetweenSeries(this.startNextSeries);
      }
    } else {
      this.startCurentSeries();
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

  this.startWorkout = () => {
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

    this.startNextSeries();
  };

  this.pauseWorkout = () => {
    if (isPauseInProgress) pauseCountdown.pause();
    else if (isRestInProgress) restCountdown.pause();
    else this.currentStation.pause();
  };

  this.resumeWorkout = () => {
    if (isPauseInProgress) pauseCountdown.resume();
    else if (isRestInProgress) restCountdown.resume();
    else this.currentStation.resume();
  };
}

export default Spartacus;
