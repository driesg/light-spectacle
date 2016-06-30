var m = model();
var v = view({
  model: m
});
var g = generator({
  model: m,
  onTaskLoaded: v.gotTask,
  // random: true
  random: false
});

window.model = m;