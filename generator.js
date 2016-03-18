"use strict";

let generator = () => {

  let con = console;

  let initPusher = (options) => {

    let onEvent = options.onEvent;

    if (options.random) {
      let taskIDs = [], tasksTotal = 10;
      while (taskIDs.length < tasksTotal) {
        taskIDs.push(Math.round(Math.random() * 1e10));
      }
      var tasksPosted = [];

      con.log("Generator - running in random mode! Pusher is not connected!");
      let doIt = () => {
        var keys = Object.keys(events);
        var key = keys[Math.floor(keys.length * Math.random())];
        var ev = events[key];

        var taskIDIndex, taskID, otherID;
        if (ev === events.TASK_POST) { // new task!!!
          taskIDIndex = Math.floor(Math.random() * taskIDs.length);
          taskID = taskIDs[taskIDIndex];
          taskIDs.splice(taskIDIndex, 1);
          tasksPosted.push(taskID);
          con.log("taskIDs", taskIDs);
        } else {
          taskIDIndex = Math.floor(Math.random() * tasksPosted.length);
          taskID = tasksPosted[taskIDIndex];
          otherID = Math.round(Math.random() * 1e10);
        }
        onEvent(ev, {
          taskID: taskID,
          id: otherID
        });
        if (taskIDs.length) {
          setTimeout(doIt, 100 + Math.random() * 400);
        } else {
          con.log("game over! you lose.");          
        }
      }
      return setTimeout(doIt, 1000);
    }

    con.log("Generator - initPusher");

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
        onEvent(events.TASK_POST, data);
      });
    });
  }

  return {
    init: initPusher
  }

}
