import React, { useState } from 'react';

import { formatCoordinates } from "utils/format";

import "components/Coordinates.css";

/**
 * Displays coordinates under the compass
 * @param {Object} props the properties for the component
 * @param {import("utils/targets").Target?} props.device the location of the device
 * @param {import("utils/targets").Target?} props.target the location of the target
 * @returns {JSX.Element}
 */
export default function Coordinates({ target, device }) {
  var [decimal, setDecimal] = useState(false);

  return (
    <button id="coords" onClick={() => setDecimal(d => !d)} aria-label="Toggle coordinate format">
      {device != null && <p>Device: <b>{formatCoordinates(device, decimal)}</b></p>}
      {target != null && <p>Target: <b>{formatCoordinates(target, decimal)}</b></p>}
    </button>
  );
}