"use strict";

let generator = () => {

  let con = console;

  let events = {
    COMMENT: "COMMENT",
    SIGNUP: "SIGNUP",
    TASK_ASSIGN: "TASK_ASSIGN",
    TASK_COMPLETE: "TASK_COMPLETE",
    TASK_POST: "TASK_POST"
  }

  let initPusher = (options) => {

    var onEvent = options.onEvent;

    con.log("initPusher");

    let channelName = 'public-notifications';

    let pusher = new Pusher(config.pusherToken, {
      authEndpoint: config.pusherEndPoint,
      encrypted: true
    });

    Pusher.log = onEvent;

    let channel = pusher.subscribe(channelName);
    channel.bind('pusher:subscription_error', (status) => {
      onEvent("pusher:subscription_error", status);
    });
    channel.bind('pusher:subscription_succeeded', (data) => {
      channel.bind('new_task_posted', (data) => {
        onEvent("new_task_posted", data);
      });
    });
  }

  return {
    init: initPusher
  }

}