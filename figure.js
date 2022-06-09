import settings from "./figure.json" assert { type: "json" };

import "./figure.scss";

import FigCaption from "./figcaption.js";

export function Figure({ src, caption }) {
  const raw = settings;
  console.log(raw);
  return (
    <figure>
      <img src={src} />
      <FigCaption caption={caption} />
    </figure>
  );
}
