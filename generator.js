"use strict";

let generator = (options) => {

  let con = console;
  const model = options.model;
  let onTaskLoaded;
  let events = {
    // COMMENT: "COMMENT"
    // SIGNUP: "SIGNUP",
    // TASK_ASSIGN: "TASK_ASSIGN",
    // TASK_COMPLETE: "TASK_COMPLETE",
    // TASK_POST: "TASK_POST"
    TASK: "TASK"
  }
	let makeName = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var length = 5 + Math.floor(Math.random() * 50);
    for( var i=0; i < length; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
	}
  let init = () => {

    onTaskLoaded = options.onTaskLoaded;

    if (options.random) {
      con.log("Generator - running in random mode! Pusher is not connected!");
      let doIt = () => {
        var keys = Object.keys(events);
        var key = keys[Math.floor(keys.length * Math.random())];
        var ev = events[key];
        onTaskLoaded(ev, {
          // fake model
          id: Math.floor( Math.random() * 100),
          name: makeName(),
          price: Math.floor( Math.random() * 1000),
        });
        setTimeout(doIt, 10000 + Math.random() * 10000);
      }
      return setTimeout(doIt, 1000);
    }

    // con.log("Generator - initPusher");

    let pusher = new Pusher(config.pusherToken, {
      authEndpoint: config.pusherEndPoint,
      encrypted: true
    });

    Pusher.log = handlePusher;

    let channel = pusher.subscribe(config.pusherChannel);
    channel.bind('pusher:subscription_error', (status) => {
      handlePusher("pusher:subscription_error", status);
    });
    channel.bind('pusher:subscription_succeeded', (data) => {
      channel.bind('new_task_posted', (data) => {
        handlePusher(events.TASK_POST, data);
      });
    });

    // checkQueue();
    loadTasks();
    checkTasks();
  }


  let handlePusher = (ev, obj) => {
    if (obj) {
      if (obj.message && obj.message.task_id) {
        loadTask(obj.message.task_id);
      } else if (obj.name) {
        gotTask({
          task: {
            name: obj.name,
            price: obj.price
          }
        });
      }
    } else {
      // con.log("progress", ev, obj);
    }
  }

  let request = (url, callback) => {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText);
        callback(response);
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  let loadTasks = () => {
    request(config.serviceURL +  "/tasks/?limit=15", (response) => {
      response.tasks.forEach(handleTask);
    });
  }

  let loadTask = (id) => {
    request(config.serviceURL +  "/tasks/" + id, (response) => {
      handleTask(response.task);
    });
  }

  let handleTask = (task) => {
    model.add(task);
  }

  let checkTasks = () => {
    var tasks = model.tasks();
    var timeout = tasks.length ? 25000 : 5000;
    con.log("loading tasks in", timeout);
    setTimeout(() => {
      loadTasks();
      checkTasks();
    }, timeout);
  }

  init();

  // setTimeout(() => {
  //   handleTask({id: 0, name: "test", price: 100, colour: { r: 100, g: 100, b: 255 }, bids_count: 1, comments_count: 0});
  //   handleTask({id: 1, name: "test2", price: 200, colour: { r: 100, g: 100, b: 255 }, bids_count: 5, comments_count: 10});
  //   handleTask({id: 2, name: "test3", price: 800, colour: { r: 100, g: 100, b: 255 }, bids_count: 0, comments_count: 5});
  // }, 100);


  return {}

}
