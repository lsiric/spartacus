const clog = (txt) => console.log(txt);
const msToSeconds = (ms) => ms / 1000;
const setHtml = (selector, html) =>
  (document.querySelector(selector).innerHTML = html);

export { clog, msToSeconds, setHtml };
