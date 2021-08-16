import { useState, useEffect, useRef } from "react";

const apiURL = new URL("https://legacy-snus.habhub.org/tracker/datanew.php");
const filter = "!RS_*;";
const timeframe = "6hours";

/**
 * Class representing an error resulting from unexpected data returned from server
 */
class BadResponseError extends Error {
  /**
   * Create a BadResponseError object
   * @param {string} message the error message
   */
  constructor(message) {
    super(message);
    this.name = "BadResponseError";
  }
}

/** @typedef {{callsign: string, data: any, gps_alt: string, gps_heading: string, gps_lat: string, gps_lon: string, gps_speed: string, gps_time: string, mission_id: string, picture: string, position_id: string, sequence: string, server_time: string, temp_inside: string, vehicle: string}} HabhubPosition */
/** @typedef {{positions: {position: Array<HabhubPosition>}, ssdv: any}} HabhubResponse */

/**
 * Fetch data from habhub API
 * @param {number} lastId 
 * @returns {HabhubResponse} response
 */
async function getNewData(lastId) {
  var url = new URL(apiURL);
  var params = url.searchParams;

  params.set('type', "positions");
  params.set('format', "json");

  params.set('position_id', lastId);

  params.set('mode', timeframe);
  params.set('max_positions', 0);

  params.set('vehicles', filter);

  var response = await fetch(url);
  var data = await response.json();

  return data;
}

/** @typedef {{latitude: number, longitude: number, altitude: number?, vehicle: string}} Coordinates */

/**
 * Update state map with new API data
 * @param {number} lastId last position id
 * @param {Map<string, Coordinates>} state 
 * @param {HabhubResponse} data 
 * @returns {[number, Map<string, Coordinates>]} array of lastId and new state
 */
function updateState(lastId, state, data) {
  state = new Map(state.entries());

  if (typeof data.positions !== "object") throw new BadResponseError('"positions" is not an object');
  if (!Array.isArray(data.positions.position)) throw new BadResponseError('"position" is not an array');

  var positions = data.positions.position;
  positions = Array.from(positions).reverse();

  for (var position of positions) {
    try {
      if (typeof position !== "object") throw new BadResponseError('"position" contains elements other than objects');

      var {
        vehicle,
        gps_lat: latitude,
        gps_lon: longitude,
        gps_alt: altitude,
        position_id: id
      } = position;

      latitude = parseFloat(latitude);
      longitude = parseFloat(longitude);
      altitude = parseFloat(altitude); // Possibly always an int?
      id = parseInt(id);

      if (typeof vehicle !== "string") throw new BadResponseError('"vehicle" is not a string');
      if (isNaN(latitude)) throw new BadResponseError('"gps_lat" is not a valid float');
      if (isNaN(longitude)) throw new BadResponseError('"gps_lon" is not a valid float');
      if (isNaN(id)) throw new BadResponseError('"position_id" is not a valid int');

      state.set(position.vehicle, {
        vehicle: position.vehicle,
        latitude: latitude,
        longitude: longitude,
        altitude: isNaN(altitude) ? null : altitude
      });

      lastId = Math.max(parseInt(position.position_id, 10), lastId);
    } catch (error) {
      if (error instanceof BadResponseError) {
        console.warn(error);
        continue;
      } else {
        throw error;
      }
    }
  }

  return [lastId, state];
}

/**
 * Create a promise that resolves after a specified amount of time
 * @param {number} time time in milliseconds
 * @returns {Promise<void>} promise that resolves after time milliseconds
 */
function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

/**
 * Subscribe for updates to habhub flight positions
 * @param {{interval: number}} options object with options
 * @returns {[Map<string, Coordinates>, string]} array of balloon positions and last error
 */
export function useHabhubData(options) {
  var [state, setState] = useState(new Map());
  var [error, setError] = useState(null);
  var [loaded, setLoaded] = useState(false);

  var stateRef = useRef();
  var idRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  var interval = (options && options.interval) || 5000;

  useEffect(() => {
    var active = true;

    async function fetchLoop() {
      while (active) {
        try {
          var id = idRef.current;
          var data = await getNewData(id);

          var state = stateRef.current;
          [id, state] = updateState(id, state, data);

          if (!active) break;

          setState(state);
          idRef.current = id;
          setError(null);
          setLoaded(true);
        } catch (error) {
          setError(error.message);
        }

        await wait(interval);
      }
    }

    fetchLoop();
    return () => active = false;
  }, [interval]);

  return [state, loaded, error];
}