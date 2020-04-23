const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DEFAULT_STATION_DURATION = 2 * SECOND;
const DEFAULT_PAUSE_DURATION = 2 * SECOND;
const DEFAULT_REST_DURATION = 2 * MINUTE;
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

// helpers
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
  restDuration = DEFAULT_REST_DURATION,
  pauseDuration = DEFAULT_PAUSE_DURATION
) {
  this.stationDuration = stationDuration;
  this.restDuration = restDuration;
  this.pauseDuration = pauseDuration;

  this.stations = [];
  this.currentStationIndex = 0;
  this.isPauseInProgress = false;
  this.pauseCountdown = undefined;

  this.nextStation = () => {
    this.currentStationIndex++;
    if (this.currentStationIndex >= this.stations.length) {
      clog("SESSION OVER!");
    } else {
      const currentStation = this.stations[this.currentStationIndex];
      currentStation.start();
    }
  };

  const createPause = (afterPause = () => {}) => {
    this.isPauseInProgress = true;
    this.pauseCountdown = new Countdown("Pause", this.pauseDuration, () => {
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

      const station = new Countdown(name, this.stationDuration, onDone);
      this.stations.push(station);
    });

    const currentStation = this.stations[this.currentStationIndex];
    currentStation.start();
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
