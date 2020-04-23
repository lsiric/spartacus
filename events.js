// "borrowed from David Walsh" : https://davidwalsh.name/pubsub-javascript
const pubsub = (() => {
  let topics = {};
  let hOP = topics.hasOwnProperty;

  return {
    subscribe: function (topic, listener) {
      // Create the topic's object if not yet created
      if (!hOP.call(topics, topic)) topics[topic] = [];

      // Add the listener to queue
      let index = topics[topic].push(listener) - 1;

      // Provide handle back for removal of topic
      return {
        remove: function () {
          delete topics[topic][index];
        },
      };
    },
    publish: function (topic, info) {
      // If the topic doesn't exist, or there's no listeners in queue, just leave
      if (!hOP.call(topics, topic)) return;

      // Cycle through topics queue, fire!
      topics[topic].forEach(function (item) {
        item(info != undefined ? info : {});
      });
    },
  };
})();

const EVENTS = {
  COUNTDOWN_TICK_EVENT: "COUNTDOWN_TICK_EVENT",
  SERIES_START_EVENT: "SERIES_START_EVENT",
  SERIES_END_EVENT: "SERIES_END_EVENT",
  WORKOUT_START_EVENT: "WORKOUT_START_EVENT",
  WORKOUT_DONE_EVENT: "WORKOUT_DONE_EVENT",
  STATION_START_EVENT: "STATION_START_EVENT",
};

export { pubsub, EVENTS };
