/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const StatusDefault = ({ className }) => {
  return (
    <svg
      className={`status-default ${className}`}
      fill="none"
      height="54"
      viewBox="0 0 55 54"
      width="55"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="g" filter="url(#filter0_d_15_1000)">
        <path
          className="path"
          d="M27.6667 51.6667C41.9341 51.6667 53.5 40.1007 53.5 25.8333C53.5 11.566 41.9341 0 27.6667 0C13.3994 0 1.83337 11.566 1.83337 25.8333C1.83337 40.1007 13.3994 51.6667 27.6667 51.6667Z"
          fill="#D9D9D9"
        />
      </g>

      <path
        className="path"
        d="M27.8334 14L35.0319 21.1985C38.8979 25.0645 38.8979 31.3326 35.0319 35.1985C31.1659 39.0645 24.8486 39.0153 20.9826 35.1493C17.0618 31.2284 17.0118 24.8215 20.9326 20.9007L27.8334 14Z"
        fill="#707070"
      />

      <defs className="defs">
        <filter
          className="filter"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="53.6667"
          id="filter0_d_15_1000"
          width="53.6667"
          x="0.833374"
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
            result="effect1_dropShadow_15_1000"
          />

          <feBlend
            className="fe-blend"
            in="SourceGraphic"
            in2="effect1_dropShadow_15_1000"
            mode="normal"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

