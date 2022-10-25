import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';

import settings from "./figure.json" assert { type: "json" };

import "./figure.scss";

import * as mylib from './mylib.js';

import { foo, bar } from './mylib.js';

import FigCaption from "./figcaption.js";

import * as Paragraph from './paragraph.js';

export function Figure({ src, caption }) {
  const raw = settings;
  console.log(raw);
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
  console.log("huhu");
  mylib.foo();
  mylib.bar();
}

if (typeof window !== 'undefined') {
  (window.wp ||= {}).figure = {
    Figure,
    foobar,
  };
}