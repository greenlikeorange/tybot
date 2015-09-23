var SlackBot = require("slackbots");
var request = require("request");
var fs = require("fs");
global._ = require("lodash");
var BOTS = _CONFIG.bots.slacks;
var yoobroFacebook = require("./services/yoobroFacebook");

function botmaker(team) {

  var token = team.token;
  var logfile = "./logs/" + team.name + ".log";

  var YooBroBot = new SlackBot({
    token: token,
    name: "Yoo bro"
  });

  fs.exists(logfile, function (exists) {
    if (!exists) {
      fs.writeFileSync(logfile, "");
    }
  });

  function logger(log) {
    fs.appendFileSync(logfile, JSON.stringify(log) + "\n");
  }

  YooBroBot.on("start", function () {
    console.log("SlackBot is started");
    YooBroBot.postMessageToUser(team.botmaster, "Hey, I'm restarted");
  });

  YooBroBot.on("close", function () {
    this.connect();
  });

  function send(channel, message, param, log) {
    YooBroBot.postMessage(channel, message, param)
      .catch(function (err){
        console.error(err);
      });
    logger(log);
  }

  function reply(message, channel, log) {
    message = message.toLowerCase();

    if (message.match(/yoobro|yoo_bro/)) {
      logger(log);
    }
    // Other replay have to implement here
  }

  function getYoobroRandomPicture(channel, data) {
    
    if (!STATUS) {
      send(channel, "Sorry I'm not STATUS yet", null, data);
    } else {
      var attachments = [
        {
          fallback: "yep, here is one!!!",
          title: "yep, here is one!!!",
          image_url: _.sample(memory).source,
          color: "#764fa5"
        }
      ];

      send(channel, " ", {
        attachments: JSON.stringify(attachments)
      }, data);
    }
  }

  function checkStatus() {
    send(team.botmaster, STATUS ? "ok": "not ok");
  }

  YooBroBot.on("message", function (data) {
    console.log(JSON.stringify(data, null, 4))
    var match;
    var channel = data.channel;
    if (data.type === "message") {
      if (!data.subtype) {
        data.text = data.text.replace(/[\s]{2,}/g, " ");
        if (data.text === "yoobro") {
          yoobro(channel, data);
        } else if (match = data.text.match(/yoo_bro:\scurl\s\<([\S]+)\>/)){
          var url = match[1].split("|")[0];
          if (url.split("/").length > 3) {
            if (url.split("/").slice(-1)[0].split(".").length > 1) {
                var filetype = url.split(".").slice(-1)[0];
                if (!filetype.match(/php|aspx/)) {
                return send(channel, "Sorry, the request look like file request", null, data);
              }
            }
          }
          request.get(url, function (err, res, body) {
            if (err) {
              return send(channel, "Sorry, something wrong", null, data);
            }

            if (res.headers['content-type'].match("json")) {
              body = JSON.parse(body);
              send(channel, "```\n" 
                  + JSON.stringify(body, null, 4)
                  + "```\n", null, data);
            } else {
              send(channel, "Sorry, I can only preform json request", null, data);
            }
          });
        } else {
          reply(data.text, data.channel, data);
        }
      }
    }
  });

  return YooBroBot;
}

BOTS = BOTS.map(botmaker);

module.exports = BOTS;
