const clog = (txt) => console.log(txt);
const msToSeconds = (ms) => ms / 1000;
const setHtml = (selector, html) =>
  (document.querySelector(selector).innerHTML = html);
const playSound = (soundName) => createjs.Sound.play(soundName);

export { clog, msToSeconds, setHtml, playSound };
