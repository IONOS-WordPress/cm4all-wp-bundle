function foo() {
  console.log('foo');
}

function bar() {
  console.log('bar');
}

window.my ??= {};
window.my.lib = {
  foo,
  bar
};