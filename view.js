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
    con.log(ev, status);
  }


  let render = (time) => {
    // con.log(tasks);

    ctx.clearRect(0, 0, sw, sh);

    for (var i = 0, il = tasks.length; i < il; i++) {
      var timeDelta = time - tasks[i].time;
      // con.log();
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.drawCircle(sw - timeDelta * 0.05, sh / 2, 2);
      ctx.fill();
    }



    requestAnimationFrame(render);
  }

  render(0);

  return {
    log: newEvent
  }
}
