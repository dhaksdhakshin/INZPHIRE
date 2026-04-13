import React from "react";
import type { InputProps } from "./InputProps";

export function ContentInput({ slideData }: InputProps) {
  return (
    <div className="p-input">
      <label className="p-input__label">{slideData.title}</label>
      {slideData.subtitle && <p className="p-input__hint">{slideData.subtitle}</p>}
      {slideData.contentHtml && <div dangerouslySetInnerHTML={{ __html: slideData.contentHtml }} />}
    </div>
  );
}
export default ContentInput;