const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DEFAULT_STATION_DURATION = 2 * SECOND;
const DEFAULT_PAUSE_DURATION = 2 * SECOND;
const DEFAULT_REST_DURATION = 2 * SECOND;
const DEEFAULT_SERIES_NUMBER = 2;
const STATION_NAMES = [
  "Goblet Squat",
  "Mountain Climber",
  // "Single-Arm Dumbbell Swing",
  // "T-Pushup",
  // "Split Jump",
  // "Dumbell Row",
  // "Dumbbell Side Lunge and Touch",
  // "Pushup-Position Row",
  // "Dumbbell Lunge and Rotation",
  // "Dumbbell Push Press",
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
  numberOfSeries = DEEFAULT_SERIES_NUMBER
) {
  this.stations = [];
  this.currentStationIndex = 0;
  this.currentSeries = 0;
  this.isPauseInProgress = false;
  this.pauseCountdown = undefined;
  this.restCountdown = undefined;

  this.nextSeries = () => {
    this.currentSeries++;
    this.currentStationIndex = 0;
    if (this.currentSeries === 1) {
      clog(`\n*** Series: ${this.currentSeries} START! ***`);
      const currentStation = this.stations[this.currentStationIndex];
      currentStation.start();
    } else if (this.currentSeries > numberOfSeries) {
      clog(`\n**********************`);
      clog(`*** WORKOUT DONE!! ***`);
      clog(`**********************\n`);
    } else {
      createRest(() => {
        clog(`\n*** Series: ${this.currentSeries} START! ***`);
        const currentStation = this.stations[this.currentStationIndex];
        currentStation.start();
      });
    }
  };

  this.nextStation = () => {
    this.currentStationIndex++;
    if (this.currentStationIndex >= this.stations.length) {
      clog(`*** Series ${this.currentSeries} DONE! ***`);
      this.nextSeries();
    } else {
      const currentStation = this.stations[this.currentStationIndex];
      currentStation.start();
    }
  };

  const createRest = (afterRest = () => {}) => {
    this.restCountdown = new Countdown("Rest", restDuration, () => {
      afterRest();
    });
    this.restCountdown.start();
  };

  const createPause = (afterPause = () => {}) => {
    this.isPauseInProgress = true;
    this.pauseCountdown = new Countdown("Pause", pauseDuration, () => {
      this.isPauseInProgress = false;
      afterPause();
    });
    this.pauseCountdown.start();
  };

  this.startWorkout = () => {
    STATION_NAMES.forEach((name, i) => {
      const nextStationWithPause = () => createPause(this.nextStation);
      // if last station, don't do pause afterwards
      const onDone =
        i === STATION_NAMES.length - 1
          ? this.nextStation
          : nextStationWithPause;

      const station = new Countdown(name, stationDuration, onDone);
      this.stations.push(station);
    });

    this.nextSeries();
  };

  this.pauseWorkout = () => {
    this.isPauseInProgress
      ? this.pauseCountdown.pause()
      : this.stations[this.currentStationIndex].pause();
  };

  this.resumeWorkout = () => {
    this.isPauseInProgress
      ? this.pauseCountdown.resume()
      : this.stations[this.currentStationIndex].resume();
  };
}

let spa = new Spartacus();
spa.startWorkout();
