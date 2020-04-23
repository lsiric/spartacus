const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DEFAULT_STATION_DURATION = 4 * SECOND;
const DEFAULT_PAUSE_DURATION = 3 * SECOND;
const DEFAULT_REST_DURATION = 2 * MINUTE;
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
  this.pauseObject = undefined;

  this.nextStation = () => {
    this.currentStationIndex++;
    const currentStation = this.stations[this.currentStationIndex];
    currentStation.start();
  };

  const createPause = (afterPause = () => {}) => {
    this.isPauseInProgress = true;
    this.pauseObject = new Countdown("Pause", this.pauseDuration, () => {
      this.isPauseInProgress = false;
      afterPause();
    });
    this.pauseObject.start();
  };

  this.start = () => {
    STATION_NAMES.forEach((name) => {
      const doNextStation = () => createPause(this.nextStation);
      this.stations.push(
        new Countdown(name, this.stationDuration, doNextStation)
      );
    });

    const currentStation = this.stations[this.currentStationIndex];
    currentStation.start();
  };

  this.pause = () => {
    if (this.isPauseInProgress) {
      this.pauseObject.pause();
    } else {
      if (this.currentStationIndex !== undefined) {
        const currentStation = this.stations[this.currentStationIndex];
        currentStation.pause();
      }
    }
  };

  this.resume = () => {
    if (this.isPauseInProgress) {
      this.pauseObject.resume();
    } else {
      if (this.currentStationIndex !== undefined) {
        const currentStation = this.stations[this.currentStationIndex];
        currentStation.resume();
      }
    }
  };
}

// let spa = new Spartacus();
// spa.start();
