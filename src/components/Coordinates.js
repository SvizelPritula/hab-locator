import React from 'react';

import { formatCoordinates } from "utils/format";

import "components/Coordinates.css";

/**
 * Displays coordinates under the compass
 * @param {Object} props the properties for the component
 * @param {import("utils/targets").Target} props.target the location of the target
 * @returns {JSX.Element}
 */
export default function Overlay({ target }) {
  return (
    <div id="coords">
      {target != null && formatCoordinates(target)}
    </div>
  );
}