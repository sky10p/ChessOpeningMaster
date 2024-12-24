import React from "react";

interface TrashListIconProps {
  className?: string;
}

export const TrashListIcon: React.FC<TrashListIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
    >
      <defs id="defs2" />
      {/* Cubo de basura */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m 17.185856,9.611427 -0.278881,7.254129 m -3.859198,0 -0.27888,-7.254129 m 8.034351,-2.5873052 c 0.275657,0.041908 0.549703,0.086249 0.823747,0.1337978 M 20.803248,7.0249273 19.942424,18.214017 A 1.8135321,1.8135321 0 0 1 18.13373,19.888109 H 11.821024 A 1.8135321,1.8135321 0 0 1 10.012328,18.214017 L 9.1515051,7.0241218 m 11.6517429,0 A 38.775735,38.775735 0 0 0 17.99993,6.7041329 m -9.6721717,0.45298 C 8.6018027,7.1095553 8.8758482,7.0652279 9.1515051,7.0241218 m 0,0 A 38.777347,38.777347 0 0 1 11.954822,6.7041329 m 6.045108,0 v -0.738308 c 0,-0.9510971 -0.733473,-1.744216 -1.684569,-1.7740385 a 41.883726,41.883726 0 0 0 -2.675969,0 c -0.951097,0.029826 -1.68457,0.823747 -1.68457,1.7740385 v 0.738308 m 6.045108,0 a 39.226298,39.226298 0 0 0 -6.045108,0"
        id="path1"
        style={{ strokeWidth: 1.20903, stroke: "currentColor" }}
      />
      {/* Líneas indicativas de múltiples elementos */}
      {/* Aumentamos longitud y las movemos un poco más a la izquierda */}
      <rect
        style={{ fill: "none", stroke: "currentColor", strokeOpacity: 1 }}
        id="rect3"
        width="4.1577773"
        height="3.657192"
        x="2.6169233"
        y="4.2700596"
      />
      <rect
        style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.11681, strokeOpacity: 1 }}
        id="rect3-2"
        width="4.1577773"
        height="3.657192"
        x="2.6179361"
        y="10.284245"
      />
      <rect
        style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.11681, strokeOpacity: 1 }}
        id="rect3-2-9"
        width="4.1577773"
        height="3.657192"
        x="2.6179361"
        y="16.412086"
      />
      <path
        style={{ fill: "none", stroke: "currentColor", strokeWidth: 0.207113, strokeOpacity: 1 }}
        d="M 3.7243361,5.8609 4.3718131,6.6878333 5.5938975,5.4645319 5.1848873,5.2385765 4.383239,6.0868499 4.0397729,5.605166 Z"
        id="path3"
      />
    </svg>
  );
};
