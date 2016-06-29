"use strict";

let generator = () => {

  let con = console;
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
  let initPusher = (options) => {

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
    var tasksURL = config.serviceURL +  "/tasks/?limit=5";
    request(tasksURL, gotTasks);
  }

  let gotTasks = (response) => {
    var tasks = response.tasks;
    con.log("Generator gotTasks", tasks);
    tasks.forEach(onTaskLoaded);
  }

  let loadTask = (id) => {
    var taskURL = config.serviceURL +  "/tasks/" + id;
    request(taskURL, gotTask);
  }

  let gotTask = (response) => {
    con.log("Generator gotTask", response);
    var task = response.task;
    onTaskLoaded(task);
    addToQueue(task.id);
  }

  let queue = [];

  let addToQueue = (id) => {
    queue.push(id);
    checkQueue();
  }

  var currentQueueItem = 0;
  let checkQueue = () => {
    con.log("checkQueue queue", queue);
    if (queue.length) {
      var id = queue[currentQueueItem];
      currentQueueItem++;
      currentQueueItem %= queue.length;
      con.log("about to load", queue, currentQueueItem);
      setTimeout(() => {
        var taskURL = config.serviceURL +  "/tasks/" + id;
        request(taskURL, (response) => {
          con.log("checkQueue got task", response.task, response.bids.length);
        });
      }, 2000);
    } else {
      con.log("no queue - checking again in 20s");
      setTimeout(checkQueue, 20000)
    }
  }


  return {
    init: initPusher
  }

}
