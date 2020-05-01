import { SECOND } from "./config.js";
import { pubsub, EVENTS } from "./events.js";

function Countdown(name, duration = 0, onDone = () => {}) {
  this.name = name;
  this.duration = duration;
  this.elapsedTime = 0;
  this.remainingTime = duration;
  this.isPaused = false;

  this.start = start;
  this.pause = pause;
  this.resume = resume;
  this.stop = stop;

  let interval = undefined;

  function pause() {
    this.isPaused = true;
  }

  function resume() {
    this.isPaused = false;
  }

  function stop() {
    clearInterval(interval);
    this.isPaused = false;
    this.elapsedTime = 0;
    this.remainingTime = this.duration;
  }

  function start() {
    interval = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedTime = this.elapsedTime + SECOND;
        this.remainingTime = this.remainingTime - SECOND;

        pubsub.publish(EVENTS.COUNTDOWN_TICK, {
          name: this.name,
          remainingTime: this.remainingTime,
        });
      }

      if (this.elapsedTime >= this.duration) {
        this.stop();
        onDone();
        pubsub.publish(EVENTS.COUNTDOWN_END, {
          name: this.name,
        });
      }
    }, SECOND);
  }
}

export default Countdown;
