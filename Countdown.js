import { SECOND } from "./config.js";
import { pubsub, EVENTS } from "./events.js";

function Countdown(name, duration = 0, onDone = () => {}) {
  let interval = undefined;
  let isPaused = false;
  let elapsedTime = 0;
  let remainingTime = duration;

  this.name = name;
  this.duration = duration;

  const pause = () => (isPaused = true);
  const resume = () => (isPaused = false);
  const stop = () => {
    clearInterval(interval);
    isPaused = false;
    elapsedTime = 0;
    remainingTime = this.duration;
  };

  const start = () => {
    interval = setInterval(() => {
      if (!isPaused) {
        elapsedTime = elapsedTime + SECOND;
        remainingTime = remainingTime - SECOND;

        pubsub.publish(EVENTS.COUNTDOWN_TICK_EVENT, {
          name: this.name,
          remainingTime: remainingTime,
        });
      }

      if (elapsedTime >= this.duration) {
        this.stop();

        onDone();
      }
    }, SECOND);
  };

  this.start = start;
  this.pause = pause;
  this.resume = resume;
  this.stop = stop;
}

export default Countdown;
