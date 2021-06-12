import React from 'react';

import "components/Compass.css";
import { formatAngle } from "utils/format";

/**
 * Calculate lines forming outside circle
 * @returns {Array<number>}
 */
function getLines() {
  var lines = [];
  for (var i = 0; i < 360; i += 5) {
    if (i % 45 > 5 && i % 45 < 40) {
      lines.push(i / 180 * Math.PI);
    }
  }
  return lines;
}

/**
 * Calculate directional labels on outside circle
 * @returns {Array<{name: string, angle: number, cardinal: boolean, underline: boolean}>}
 */
function getLabels() {
  var names = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  var labels = [];

  for (var [i, name] of names.entries()) {
    labels.push({
      name,
      angle: i / names.length,
      cardinal: !Boolean(i % 2),
      underline: i === 0
    });
  }

  return labels;
}

/**
 * The main compass display
 * @param {Object} props the properties for the component
 * @param {boolean} props.loading whether the target is still loading and should not be displayed
 * @param {number} props.heading what direction the device is facing
 * @param {number} props.bearing what direction the target is in relation to north
 * @param {string} props.targetName what the current target should be shown as
 * @returns {JSX.Element}
 */
export default function Compass({ loading, heading, bearing, targetName }) {
  return (
    <svg
      viewBox="0 0 100 100"
      id="compass"
      role="img"
      aria-label={`A compass with north at ${formatAngle(-heading)} clockwise and an arrow labeled ${targetName} at ${formatAngle(bearing - heading)} clockwise.`}
    >
      <g
        style={{
          transform: `rotate(${heading == null ? 0 : -heading}deg)`,
          transformOrigin: "50px 50px",
          willChange: "transform"
        }}
        aria-hidden="true"
      >
        {getLines().map(angle => (
          <line
            key={angle}
            stroke="#aaaaaa"
            strokeWidth="0.5"
            x1={50 + Math.cos(angle) * 40}
            y1={50 + Math.sin(angle) * 40}
            x2={50 + Math.cos(angle) * 44}
            y2={50 + Math.sin(angle) * 44}
          />
        ))}

        {getLabels().map(({ name, angle, cardinal, underline }) => (
          <g style={{
            transform: `rotate(${angle}turn)`,
            transformOrigin: "50px 50px"
          }}>
            <text
              key={name}
              x={50}
              y={10}
              style={{
                fill: "white",
                fontSize: cardinal ? "8px" : "6px",
                textDecoration: underline ? "underline solid" : "none",
                textAnchor: "middle"
              }}
            >
              {name}
            </text>
          </g>
        ))}

        {!loading && <g
          style={{
            transform: `rotate(${bearing}deg)`,
            transformOrigin: "50px 50px"
          }}
        >
          <path
            fill="white"
            d="M50 15, 40 30, 50 25, 60 30, z"
          />

          <text
            x={50}
            y={37.5}
            style={{
              fill: "white",
              fontSize: "8px",
              textAnchor: "middle",
            }}
          >
            {formatAngle(bearing)}
          </text>

          <text
            x={50}
            y={45}
            style={{
              fill: "white",
              fontSize: "6px",
              textAnchor: "middle",
              fontFamily: "monospace"
            }}
          >
            {
              targetName.length > 16 ?
                targetName.slice(0, 15).concat('\u2026') :
                targetName
            }
          </text>
        </g>}
      </g>
    </svg >
  );
}