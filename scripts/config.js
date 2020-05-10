// sound handlers
createjs.Sound.registerSound({ src: "audio/pause.mp3", id: "pause" });
createjs.Sound.registerSound({ src: "audio/countdown.mp3", id: "countdown" });

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const STATION_DURATION = 40 * SECOND;
const PAUSE_DURATION = 20 * SECOND;
const REST_DURATION = 60 * SECOND;
const SERIES_NUMBER = 3;

const STATION_NAMES = [
  "Plank with leg lift",
  "Dumbell Chop",
  "Dumbell Lunge",
  "Single leg deadlift",
  "Dumbell push press",
  "Goblet Squat",
  "Dumbell alternating Row",
  "Dumbell Side Lunge and Touch",
  "Dumbell deadlift",
];

const defaultParams = {
  name: "Le Wonderwoman!",
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
