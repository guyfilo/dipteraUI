/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const Wash = ({ className }) => {
  return (
    <svg
      className={`wash ${className}`}
      fill="none"
      height="54"
      viewBox="0 0 54 54"
      width="54"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="g" filter="url(#filter0_d_45_464)">
        <path
          className="path"
          d="M26.8333 51.6667C41.1007 51.6667 52.6667 40.1007 52.6667 25.8333C52.6667 11.566 41.1007 0 26.8333 0C12.566 0 1 11.566 1 25.8333C1 40.1007 12.566 51.6667 26.8333 51.6667Z"
          fill="#D9D9D9"
        />
      </g>

      <path
        className="path"
        d="M27 14L34.1985 21.1985C38.0645 25.0645 38.0645 31.3326 34.1985 35.1985C30.3326 39.0645 24.0153 39.0153 20.1493 35.1493C16.2284 31.2284 16.1785 24.8215 20.0993 20.9007L27 14Z"
        fill="#707070"
      />

      <defs className="defs">
        <filter
          className="filter"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="53.6667"
          id="filter0_d_45_464"
          width="53.6667"
          x="0"
          y="0"
        >
          <feFlood
            className="fe-flood"
            floodOpacity="0"
            result="BackgroundImageFix"
          />

          <feColorMatrix
            className="fe-color-matrix"
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />

          <feOffset className="fe-offset" dy="1" />

          <feGaussianBlur className="fe-gaussian-blur" stdDeviation="0.5" />

          <feComposite
            className="fe-composite"
            in2="hardAlpha"
            operator="out"
          />

          <feColorMatrix
            className="fe-color-matrix"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />

          <feBlend
            className="fe-blend"
            in2="BackgroundImageFix"
            mode="normal"
            result="effect1_dropShadow_45_464"
          />

          <feBlend
            className="fe-blend"
            in="SourceGraphic"
            in2="effect1_dropShadow_45_464"
            mode="normal"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

