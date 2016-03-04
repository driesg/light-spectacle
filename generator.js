"use strict";

let con = console;

let events = {
  COMMENT: "COMMENT",
  SIGNUP: "SIGNUP",
  TASK_ASSIGN: "TASK_ASSIGN",
  TASK_COMPLETE: "TASK_COMPLETE",
  TASK_POST: "TASK_POST"
}

setInterval(()=> {
  var ev = events.COMMENT;
  con.log('ok', ev);
}, 1000);