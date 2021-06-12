import { useState, useEffect, useRef } from "react";

const apiURL = new URL("https://spacenear.us/tracker/datanew.php");
const filter = "!RS_*;";
const timeframe = "6hours";

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

/** @typedef {{latitude: number, longitude: number, altitude: number, vehicle: string}} Coordinates */

/**
 * Update state map with new API data
 * @param {number} lastId last position id
 * @param {Map<string, Coordinates>} state 
 * @param {HabhubResponse} data 
 * @returns {[number, Map<string, Coordinates>]} array of lastId and new state
 */
function updateState(lastId, state, data) {
  state = new Map(state.entries());

  if (typeof data.positions !== "object") throw new Error('"positions" is not an object');
  if (!Array.isArray(data.positions.position)) throw new Error('"position" is not an array');

  var positions = data.positions.position;
  positions = Array.from(positions).reverse();

  for (var position of positions) {
    if (typeof position !== "object") throw new Error('"position" contains elements other than objects');

    if (typeof position.vehicle !== "string") throw new Error('"vehicle" is not a string');
    if (isNaN(parseFloat(position.gps_lat))) throw new Error('"gps_lat" is not a valid float');
    if (isNaN(parseFloat(position.gps_lon))) throw new Error('"gps_lon" is not a valid float');
    if (isNaN(parseFloat(position.gps_alt))) throw new Error('"gps_alt" is not a valid float'); // Possibly always an int?
    if (isNaN(parseInt(position.position_id, 10))) throw new Error('"position_id" is not a valid int');

    state.set(position.vehicle, {
      vehicle: position.vehicle,
      latitude: parseFloat(position.gps_lat),
      longitude: parseFloat(position.gps_lon),
      altitude: parseFloat(position.gps_alt)
    });

    lastId = Math.max(parseInt(position.position_id, 10), lastId);
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