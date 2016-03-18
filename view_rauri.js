"use strict";

let con = console;

let view = ()=> {

  var sw = 600, sh = 300;

  let canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  document.body.appendChild(canvas);

  let ctx = canvas.getContext("2d");
  var circleRads = Math.PI * 2;
  ctx.drawCircle = (x, y, r) => {
    ctx.arc(x, y, r, 0, circleRads, false);
  }


  var tasks = [];
  var startTime = new Date().getTime();

  let newEvent = (ev, status) => {
    if (status.taskID) {
      tasks.push({
        id: status.taskID,
        time: new Date().getTime() - startTime
      });
    }
    // con.log(ev, status);
  }


  let render = (time) => {
    // con.log(tasks);

    var linePosted = sh * 1 / 4;
    var lineAssigned = sh * 2 / 4;
    var lineCompleted = sh * 3 / 4;

    ctx.clearRect(0, 0, sw, sh);

    ctx.fillStyle = "red";
    ctx.fillRect(0, linePosted - 0.25, sw, 0.5);
    ctx.fillStyle = "green";
    ctx.fillRect(0, lineAssigned - 0.25, sw, 0.5);
    ctx.fillStyle = "blue";
    ctx.fillRect(0, lineCompleted - 0.25, sw, 0.5);

    for (var i = 0, il = tasks.length; i < il; i++) {
      var task = tasks[i];
      var timeDelta = time - task.time;
      var y;
      switch (task.status) {
        case events.TASK_POST :
          ctx.fillStyle = "red";
          y = linePosted;
          break;
        case events.TASK_ASSIGN :
          ctx.fillStyle = "green";
          // otherID = Math.round(Math.random() * 1e10);
          y = lineAssigned;
          break;
        case events.TASK_COMPLETE :
          ctx.fillStyle = "blue";
          y = lineCompleted;
          break;
      }

      // con.log(task);

      ctx.beginPath();
      ctx.drawCircle(sw - timeDelta * 0.005, y, 2);
      ctx.fill();
    }



    requestAnimationFrame(render);
  }

  render(0);

  return {
    log: newEvent
  }
}
