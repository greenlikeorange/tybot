global._ = require("lodash");

try {
  global._CONFIG = require("./config");
} catch (e) {
  throw e;
}

var yoobrobots = require("./yoobroslackbots");
