import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';

// we cannot use
// import settings from './figure.json' assert { type: 'json' };
// since import...assert its not (yet) supported by eslint

import './figure.scss';

import * as mylib from './mylib.js';

import { foo, bar } from './mylib.js';

import Circle from './circle.svg';
console.log(Circle);

import FigCaption from './figcaption.js';

import * as Paragraph from './paragraph.js';

// eslint-disable-next-line react/prop-types
export function Figure({ src, caption }) {
  // const raw = settings;
  // console.log(raw);
  return (
    <>
      <Button icon={close}></Button>
      <figure>
        <img src={src} />
        <FigCaption caption={caption} />
      </figure>
    </>
  );
}

export default function foobar() {
  // eslint-disable-next-line no-console
  console.log('huhu');
  mylib.foo();
  mylib.bar();
}

if (typeof window !== 'undefined') {
  (window.wp ||= {}).figure = {
    Figure,
    foobar,
  };
}
