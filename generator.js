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
      var tasksPosted = [], tasksAssigned = [], tasksCompleted = [];
      var taskIDIndex, taskID, otherID;

      let postTask = () => {
        taskIDIndex = Math.floor(Math.random() * taskIDs.length);
        taskID = taskIDs[taskIDIndex];
        if (!taskID) return
        taskIDs.splice(taskIDIndex, 1);
        tasksPosted.push(taskID);
        // con.log("taskIDs", taskIDs);
      }

      let assignTask = () => {
        taskIDIndex = Math.floor(Math.random() * tasksPosted.length);
        taskID = tasksPosted[taskIDIndex];
        if (!taskID) return
        tasksPosted.splice(taskIDIndex, 1);
        tasksAssigned.push(taskID);
      }

      let completeTask = () => {
        taskIDIndex = Math.floor(Math.random() * tasksAssigned.length);
        taskID = tasksAssigned[taskIDIndex];
        if (!taskID) return
        tasksAssigned.splice(taskIDIndex, 1);
        tasksCompleted.push(taskID);
      }

      let dispatch = (ev) => {
        con.log("================");
        con.log("tasksPosted   ", tasksPosted);
        con.log("tasksAssigned ", tasksAssigned);
        con.log("tasksCompleted", tasksCompleted);
        onEvent(ev, {
          status: ev,
          taskID: taskID
          // id: otherID
        });
      }

      postTask();
      dispatch(events.TASK_POST);

      con.log("Generator - running in random mode! Pusher is not connected!");
      let doIt = () => {
        var keys = Object.keys(events);
        var key = keys[Math.floor(keys.length * Math.random())];
        var ev = events[key];

        switch (ev) {
          case events.TASK_POST :
            postTask();
            break;
        
          case events.TASK_ASSIGN :
            assignTask();
            // otherID = Math.round(Math.random() * 1e10);
            break;

          case events.TASK_COMPLETE :
            completeTask();
            break;

        }

        dispatch(ev);
        if (taskIDs.length) {
          setTimeout(doIt, 100 + Math.random() * 4000);
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
