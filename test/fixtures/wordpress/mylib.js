export function foo() {
  console.log('foo');
}

export function bar() {
  console.log('bar');
  // that will doesnt work 
  // return (<bar></bar>);
}

if (typeof window !== 'undefined') {
  window.my ??= {};
  window.my.lib = {
    foo,
    bar
  };
}