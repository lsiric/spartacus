const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DEFAULT_STATION_DURATION = 60 * SECOND;
const DEFAULT_PAUSE_DURATION = 15 * SECOND;
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
  this.interval = undefined;
  this.isPaused = false;
  this.elapsedTime = 0;
  this.remainingTime = duration;

  const pause = () => (this.isPaused = true);
  const resume = () => (this.isPaused = false);
  const stop = () => {
    clearInterval(this.interval);
    this.isPaused = false;
    this.elapsedTime = 0;
    this.remainingTime = duration;
  };

  const start = () => {
    if (name) clog(`\nStarting: ${name}`);

    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedTime = this.elapsedTime + SECOND;
        this.remainingTime = this.remainingTime - SECOND;
        clog(`\tremaining time: ${msToSeconds(this.remainingTime)}sec`);
      }

      if (this.elapsedTime >= duration) {
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

  this.nextSeries = () => {
    this.currentSeries++;
    this.currentStationIndex = 0;

    clog(`\n*** Series: ${this.currentSeries} START! ***`);

    this.currentStation = this.stations[this.currentStationIndex];
    this.currentStation.start();
  };

  this.nextStation = () => {
    this.currentStationIndex++;
    if (this.currentStationIndex >= this.stations.length) {
      clog(`*** Series ${this.currentSeries} DONE! ***`);
      if (this.currentSeries >= numberOfSeries) {
        clog(`\n**********************`);
        clog(`*** WORKOUT DONE!! ***`);
        clog(`**********************\n`);
      } else {
        createRest(this.nextSeries);
      }
    } else {
      this.currentStation = this.stations[this.currentStationIndex];
      this.currentStation.start();
    }
  };

  const createRest = (afterRest = () => {}) => {
    isRestInProgress = true;
    restCountdown = new Countdown("Rest", restDuration, () => {
      isRestInProgress = false;
      afterRest();
    });
    restCountdown.start();
  };

  const createPause = (afterPause = () => {}) => {
    isPauseInProgress = true;
    pauseCountdown = new Countdown("Pause", pauseDuration, () => {
      isPauseInProgress = false;
      afterPause();
    });
    pauseCountdown.start();
  };

  this.startWorkout = () => {
    const isLastStation = (index) => index === STATION_NAMES.length - 1;
    STATION_NAMES.forEach((name, i) => {
      const nextStationWithPause = () => createPause(this.nextStation);
      const nextStationNoPause = this.nextStation;
      // if last station, don't do pause afterwards
      const onDone = isLastStation(i)
        ? nextStationNoPause
        : nextStationWithPause;
      const station = new Countdown(name, stationDuration, onDone);
      this.stations.push(station);
    });

    this.nextSeries();
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
