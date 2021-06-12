import React from 'react';

import { formatAngle, formatDistance } from "utils/format";

import "components/Overlay.css";

/**
 * Displays bearing and distance in the corners of the screen
 * @param {Object} props the properties for the component
 * @param {number} props.bearing what direction the target is in relation to north
 * @param {number} props.distance how far the target is in meters
 * @returns {JSX.Element}
 */
export default function Overlay({ bearing, distance }) {
  return (
    <div id="overlay">
      <div id="bearing">
        {formatAngle(bearing)}
      </div>
      <div id="distance">
        {formatDistance(distance)}
      </div>
    </div>
  );
}