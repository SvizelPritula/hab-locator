import { useEffect, useRef, useState } from "react";

// Fun fact: Chrome and Opera act the same in relation to absolute orientation
// Not so fun fact: They are the only two browsers I tested that do that

/**
 * Class representing an error that could be fixed if the methof is called again,
 * this time with an user gesture backing it up
 */
class TryAgainError extends Error {
  /**
   * Create a TryAgainError object
   * @param {string} message the error message
   */
  constructor(message) {
    super(message);
    this.name = "TryAgainError";
  }
}

/**
 * Extract heading from quaternion
 * @param {[number, number, number, number]} q quaternion
 * @returns {number} heading, in radians
 */
function headingFromQuaternion(q) {
  return Math.atan2(2 * (q[0] * q[1] + q[2] * q[3]), 1 - 2 * (q[1] ** 2 + q[2] ** 2));
}

/**
 * Attempt to find a source of absolute direction and bind a callback to it
 * @param {(heading: number) => void} callback function to call for each new reading
 * @returns {Promise<() => void>} function to remove event listeners 
 */
async function startHeadingSensor(callback) {
  if ("AbsoluteOrientationSensor" in window) { // Modern Chromium broswers (Chrome, Edge and Opera)
    const sensor = new window.AbsoluteOrientationSensor({ frequency: 60 });

    if ("permissions" in navigator) {
      var results = await Promise.all([
        navigator.permissions.query({ name: "accelerometer" }),
        navigator.permissions.query({ name: "magnetometer" }),
        navigator.permissions.query({ name: "gyroscope" })
      ]);

      if (results.every(result => ["granted", "prompt"].includes(result.state))) {
        sensor.addEventListener('reading', () => {
          var heading = -headingFromQuaternion(sensor.quaternion);
          heading *= 180 / Math.PI;
          if (heading < 0) heading += 360;

          callback(heading, true);
        });

        sensor.start();
        return () => sensor.stop();
      } else {
        throw new Error("Device orientation sensor permission denied, check browser settings.")
      }
    }
  }

  /**
   * Callback for DeviceOrientationEvent
   * @param {DeviceOrientationEvent} event the event
   */
  function deviceOrientationEventCallback(event) {
    if ("webkitCompassHeading" in event) { // Works on Safari
      if (event.webkitCompassHeading >= 0) {
        callback(event.webkitCompassHeading, true);
        return;
      }
    }

    if (event.alpha != null) {
      // Only on Firefox should we be forced to use relative orientation
      var heading = -event.alpha;
      if (heading < 0) heading += 360;

      callback(heading, event.absolute === true);
    }
  }

  if ("requestPermission" in window.DeviceOrientationEvent) {
    try {
      var result = await window.DeviceOrientationEvent.requestPermission();

      if (result === "denied") {
        throw new Error("Device orientation event permission denied, check browser settings.");
      }
    } catch (e) {
      throw new TryAgainError("Device orientation event request invalid, try again.");
    }
  }

  // The absolute version is also Chrome, Edge and Opera only, but it also work on older versions
  var eventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";

  window.addEventListener(eventName, deviceOrientationEventCallback);
  return () => window.removeEventListener(eventName, deviceOrientationEventCallback);
}

/**
 * Use a browser-specific API to obtain the current preferably absolute heading
 * @returns {[number, boolean, boolean, () => void, string]} array of current heading, a boolean indicating whether the heading is absolute, a boolean indicating whether user permission is required, a function to grant it and the message of the last error
 */
export function useHeading() {
  var [heading, setHeading] = useState(null);
  var [absolute, setAbsolute] = useState(true);
  var [error, setError] = useState(null);

  // On Safari, an user gesture is required
  // When we detect that, we return that from this hook alongside with a function to retry
  // But only on the first error
  /** @type {["testing"|"pending"|"granted", (value: "testing"|"pending"|"granted") => void]} */
  var [permissionState, setPermissionState] = useState("testing");

  var isRenderPending = useRef(false);

  useEffect(() => {
    if (["testing", "granted"].includes(permissionState)) {
      var callback = null;
      var cleanupRequested = false;

      startHeadingSensor((heading, absolute) => {
        if (isRenderPending.current) {
          return;
        }

        setHeading(heading);
        setAbsolute(absolute);

        // Did you know Firefox sometimes sends events faster than React draws frames?
        // We have to limit how often we update the heading value, otherwise we risk overloading it
        isRenderPending.current = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isRenderPending.current = false;
          });
        });
      }).then(cleanupCallback => {
        if (cleanupRequested) {
          cleanupCallback();
        } else {
          callback = cleanupCallback;
        }
      }).catch(error => {
        if (permissionState === "testing" && error instanceof TryAgainError) {
          setPermissionState("pending");
        } else {
          setError(error.message);
        }
      });

      return () => {
        if (callback) {
          callback();
        } else {
          cleanupRequested = true;
        }
      }
    }
  }, [permissionState]);

  var orientation = useOrientation();

  async function requestPermission() {
    try {
      await window.DeviceOrientationEvent.requestPermission();
      setPermissionState("granted"); // Try effect again
    } catch (error) {
      setError(error.message);
    }
  }

  // Use 0 if no orientation data exists, so the app shows something on desktop 
  return [
    heading == null ? 0 : heading + orientation,
    absolute,
    permissionState === "pending",
    requestPermission,
    error
  ]; // Quite a lot of values, I underestimated how hard compass heading is. Maybe refactor into an object?
}

/**
 * Listen for changes to screen orientation (portrait, landscape...)
 * @returns {number} current screen orientation, in degrees, or 0 if not supported
 */
export function useOrientation() {
  // Supported on all modern browsers except for Safari

  var screen = window.screen;
  var [orientation, setOrientation] = useState(screen.orientation ? screen.orientation.angle : 0);

  useEffect(() => {
    var screen = window.screen;

    if (screen.orientation) {
      function handler() {
        setOrientation(screen.orientation.angle);
      }

      handler(); // The orientation *could* change between first render and useEffect

      screen.orientation.addEventListener("change", handler);
      return () => screen.orientation.removeEventListener("change", handler);
    }
  }, []);

  return orientation;
}