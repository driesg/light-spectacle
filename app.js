var g = generator();
var m = model();
var v = view();

g.init({
  onEvent: v.log
});
