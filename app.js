var g = generator();
var m = model();
var v = view();
// var r = render();

g.init({
  onEvent: v.log,
  random: false
});
