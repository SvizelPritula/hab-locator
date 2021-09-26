import React, { useState, useEffect } from 'react';

import { useGeolocation } from 'utils/geolocation';
import { useHeading } from 'utils/heading';
import { useHabhubData } from "utils/habhub";
import { computeTargets, getSelectedTarget } from "utils/targets";
import { useLocationHash } from "utils/hash";

import Dropdown from "components/Dropdown";
import CompassWrapper from "components/CompassWrapper";
import BottomButton from "components/BottomButton";

import "components/App.css";

const habhubOptions = { interval: 10 * 1000 };
/** @type {PositionOptions} */
const geolocationOptions = { maximumAge: 60 * 1000, timeout: 20 * 1000, enableHighAccuracy: true };

/**
 * The root component of the app
 * @returns {JSX.Element}
 */
export default function App() {
  var [flights, habhubLoaded, habhubError] = useHabhubData(habhubOptions);
  var [coords, geolocationError] = useGeolocation(geolocationOptions);
  var [headingRaw, headingAbsolute, permissionRequired, grantPermission, headingError] = useHeading();

  var [selection, setSelection] = useLocationHash();
  var targets = computeTargets(flights, coords, !habhubLoaded && habhubError == null);
  var target = getSelectedTarget(targets, selection);

  var [headingOffset, setHeadingOffset] = useState(null);
  var heading = headingRaw;

  if (headingError != null) {
    heading = 0;
  }

  if (heading != null && !headingAbsolute && headingOffset != null) {
    heading -= headingOffset;
  }

  // If the last selected target cannot be found, a new target will be selected
  // However, this would cause the target to change whenever it moves farther that another one
  // Therefore, if the autoassigned target differs from the selected one, save it as the current selection
  // However, wait until the flights actually get loaded from the server
  // Also wait for coordinates, to lock the closest balloon on first visit even if coordinates arrive after flight data
  var shouldLockSelection = (habhubLoaded || habhubError) && (coords || geolocationError);
  useEffect(() => {
    if (shouldLockSelection && target && target.id !== selection) {
      setSelection(target.id);
    }
  }, [shouldLockSelection, selection, setSelection, target]);

  useEffect(() => {
    if (target != null) {
      document.title = `${target.name} | High-altitude Balloon Locator`
    } else {
      document.title = "High-altitude Balloon Locator";
    }
  }, [target]);

  return (
    <>
      <Dropdown
        targets={targets}
        target={target}
        setTarget={setSelection}
        errors={[
          habhubError && {
            type: "error",
            error: habhubError,
            id: "network"
          },
          geolocationError && {
            type: "error",
            error: geolocationError,
            id: "gps"
          },
          headingError && {
            type: "error",
            error: headingError,
            id: "heading"
          },
          !headingAbsolute && headingOffset == null && {
            type: "warning",
            error: "Cannot obtain absolute heading, please calibrate the compass using the button below.",
            id: "calibrate"
          },
          permissionRequired && {
            type: "warning",
            error: "Access to motion sensors denied, please allow access using the button below.",
            id: "permission"
          }
        ].filter(Boolean)}
      />
      <CompassWrapper
        target={target}
        coords={coords}
        heading={heading}
      />
      {!headingAbsolute && (
        <BottomButton
          label="Calibrate North"
          onPress={() => setHeadingOffset(headingRaw)}
        />
      )}
      {permissionRequired && (
        <BottomButton
          label="Enable Compass"
          onPress={grantPermission}
        />
      )}
    </>
  );
}