const authResolver = require("./auth");
const eventsResolver = require("./events");
const bookingsResolver = require("./booking");

const rootResolver = {
  ...authResolver,
  ...bookingsResolver,
  ...eventsResolver
};

module.exports = rootResolver;
