"use strict";

let view = ()=> {

  let customLog = (ev, status) => {
    var div = document.createElement("div");
    div.innerHTML = "### " + ev + " " + status;
    document.body.appendChild(div);
  }

  let otherLog = (ev, status) => {
    con.log(ev, status);
  }

  return {
    log: customLog
  }
}