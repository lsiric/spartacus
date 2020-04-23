const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DEFAULT_STATION_DURATION = 10 * SECOND;
const DEFAULT_PAUSE_DURATION = 5 * SECOND;
const DEFAULT_REST_DURATION = 2 * MINUTE;
const DEFAULT_SERIES_NUMBER = 3;

const STATION_NAMES = [
  "Goblet Squat",
  "Mountain Climber",
  "Single-Arm Dumbbell Swing",
  "T-Pushup",
  "Split Jump",
  "Dumbell Row",
  "Dumbbell Side Lunge and Touch",
  "Pushup-Position Row",
  "Dumbbell Lunge and Rotation",
  "Dumbbell Push Press",
];

// let startAudio = new Audio("audio/boxing-bell.mp3");
// startAudio.play();

// helper methods
const clog = (txt) => console.log(txt);
const msToSeconds = (ms) => ms / 1000;

function Countdown(name, duration = 0, onDone = () => {}) {
  let interval = undefined;
  let isPaused = false;
  let elapsedTime = 0;
  let remainingTime = duration;

  const pause = () => (isPaused = true);
  const resume = () => (isPaused = false);
  const stop = () => {
    clearInterval(interval);
    isPaused = false;
    elapsedTime = 0;
    remainingTime = duration;
  };

  const start = () => {
    if (name) clog(`\nStarting: ${name}`);

    interval = setInterval(() => {
      if (!isPaused) {
        elapsedTime = elapsedTime + SECOND;
        remainingTime = remainingTime - SECOND;
        clog(`\tremaining time: ${msToSeconds(remainingTime)}sec`);
      }

      if (elapsedTime >= duration) {
        this.stop();
        if (name) clog(`Done: ${name}`);
        onDone();
      }
    }, SECOND);
  };

  this.start = start;
  this.pause = pause;
  this.resume = resume;
  this.stop = stop;
}

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
  };

  this.startNextSeries = () => {
    this.currentSeries++;
    this.currentStationIndex = 0;

    clog(`\n*** Series: ${this.currentSeries} START! ***`);

    this.startCurentSeries();
  };

  this.nextStation = () => {
    this.currentStationIndex++;
    if (isLastStation()) {
      clog(`*** Series ${this.currentSeries} DONE! ***`);

      if (isLastSeries()) {
        clog(`\n**********************`);
        clog(`*** WORKOUT DONE!! ***`);
        clog(`**********************\n`);
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

let spa = new Spartacus();
spa.startWorkout();
