import { useEffect, useState } from "react";

/**
 * Listen for position updates
 * @param {PositionOptions} options options to pass to watchPosition
 * @returns {[GeolocationCoordinates, string]} array of coordinates and string
 */
export function useGeolocation(options) {
  var [coords, setCoords] = useState(null);
  var [error, setError] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in your browser");

      return null;
    }

    /** @type {PositionCallback} */
    function onCoords(position) {
      setCoords(position.coords);
      setError(null);
    }

    /** @type {PositionErrorCallback} */
    function onError(error) {
      switch (error.code) {
        case window.GeolocationPositionError.PERMISSION_DENIED:
          setError("Geolocation permission denied");
          break;
        case window.GeolocationPositionError.POSITION_UNAVAILABLE:
          setError("Could not obtain device position");
          break;
        case window.GeolocationPositionError.TIMEOUT:
          setError("Timed out while getting position");
          break;
        default:
          setError("Unknown geolocation error: " + error.message);
          break;
      }
    }

    var request = navigator.geolocation.watchPosition(onCoords, onError, options);
    return () => navigator.geolocation.clearWatch(request);
  }, [options]);

  return [coords, error];
}