/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const StatusDefault2 = ({ className }) => {
  return (
    <svg
      className={`status-default-2 ${className}`}
      fill="none"
      height="54"
      viewBox="0 0 55 54"
      width="55"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="g" filter="url(#filter0_d_12_980)">
        <path
          className="path"
          d="M27.6666 51.6667C41.9339 51.6667 53.4999 40.1007 53.4999 25.8333C53.4999 11.566 41.9339 0 27.6666 0C13.3992 0 1.83325 11.566 1.83325 25.8333C1.83325 40.1007 13.3992 51.6667 27.6666 51.6667Z"
          fill="#D9D9D9"
        />
      </g>

      <path
        className="path"
        d="M39.6508 26.5L21.8333 35.6848L21.8333 17.3152L39.6508 26.5Z"
        fill="#707070"
        stroke="#707070"
        strokeWidth="2"
      />

      <defs className="defs">
        <filter
          className="filter"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="53.6667"
          id="filter0_d_12_980"
          width="53.6666"
          x="0.833252"
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
            result="effect1_dropShadow_12_980"
          />

          <feBlend
            className="fe-blend"
            in="SourceGraphic"
            in2="effect1_dropShadow_12_980"
            mode="normal"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

