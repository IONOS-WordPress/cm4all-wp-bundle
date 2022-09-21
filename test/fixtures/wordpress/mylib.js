export function foo() {
  console.log('foo');
}

export function bar() {
  console.log('bar');
  // that will do not work 
  // return (<bar></bar>);
}

if (typeof window !== 'undefined') {
  (window.my ||= {}).lib = {
    foo,
    bar
  };

  console.log(window.my.lib);
}

