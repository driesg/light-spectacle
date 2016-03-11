"use strict";

// var config = require("./config");

let con = console;

let events = {
  COMMENT: "COMMENT",
  SIGNUP: "SIGNUP",
  TASK_ASSIGN: "TASK_ASSIGN",
  TASK_COMPLETE: "TASK_COMPLETE",
  TASK_POST: "TASK_POST"
}

let initPusher = ()=> {

  let channelName = 'public-notifications';

  let pusher = new Pusher(config.pusherToken, {
    authEndpoint: config.pusherEndPoint,
    encrypted: true
  });

  let customLog = (message) => {
    var div = document.createElement("div");
    div.innerHTML = "### " + message;
    document.body.appendChild(div);
  }

  Pusher.log = customLog;

  let channel = pusher.subscribe(channelName);
  channel.bind('pusher:subscription_error', (status) => {
    customLog("pusher:subscription_error", status);
  });
  channel.bind('pusher:subscription_succeeded', (data) => {
    channel.bind('new_task_posted', (data) => {
      customLog("new_task_posted", data);
    });
  });
}