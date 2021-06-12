import React from 'react';
import { getPreciseDistance, getGreatCircleBearing } from 'geolib';

import Compass from "components/Compass";
import Coordinates from "components/Coordinates";
import Overlay from "components/Overlay";
import Loading from "components/Loading";

import "components/CompassWrapper.css";

/**
 * A wrapper for Overlay and Compass
 * @param {Object} props the properties of the component
 * @param {import("utils/targets").Target} props.target the current tracked target
 * @param {GeolocationCoordinates} props.coords the current position of the device
 * @param {number?} props.heading what direction the device is facing
 * @returns {JSX.Element}
 */
export default function CompassWrapper({ target, coords, heading }) {
  var loading = coords == null || heading == null || target == null;

  if (!loading) {
    var bareCoords = { latitude: coords.latitude, longitude: coords.longitude };

    var bearing = getGreatCircleBearing(bareCoords, target);
    var distance = getPreciseDistance(bareCoords, target, 0.1);
  }

  return (
    <div id="wrapper">
      <div id="compass-grid">
        <Compass
          loading={loading}
          heading={heading}
          bearing={bearing}
          targetName={target && target.id}
        />
        <Coordinates
          target={target}
        />
      </div>
      {!loading && (
        <Overlay
          bearing={bearing}
          distance={distance}
          target={target}
          device={coords}
        />
      )}
      {loading && (
        <Loading
          items={[
            coords == null && "GPS coordinates",
            target == null && "flight data from habhub"
          ].filter(Boolean)}
        />
      )}
    </div>
  );
}