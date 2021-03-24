// sound handlers
createjs.Sound.registerSound({ src: "audio/boxing-bell.mp3", id: "start" });
createjs.Sound.registerSound({ src: "audio/pause.mp3", id: "pause" });
createjs.Sound.registerSound({ src: "audio/countdown.mp3", id: "countdown" });
createjs.Sound.registerSound({ src: "audio/half-time.mp3", id: "halfTime" });

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const STATION_DURATION = 5 * SECOND;
const PAUSE_DURATION = 16 * SECOND;
const REST_DURATION = 120 * SECOND;
const SERIES_NUMBER = 3;

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

const defaultParams = {
  name: "Le Spartacus!",
  stationDuration: STATION_DURATION,
  pauseDuration: PAUSE_DURATION,
  restDuration: REST_DURATION,
  numberOfSeries: SERIES_NUMBER,
};

export {
  SECOND,
  MINUTE,
  STATION_DURATION,
  PAUSE_DURATION,
  REST_DURATION,
  SERIES_NUMBER,
  STATION_NAMES,
  defaultParams,
};
