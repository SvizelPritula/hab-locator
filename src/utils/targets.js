import { getDistance } from "geolib";

/** @typedef {{name: string, id: string, latitude: number, longitude: number, altitude: number, distance: number?, virtual: boolean}} Target */

const collator = new Intl.Collator("en-uk", {
  usage: "sort",
  sensitivity: "accent",
  numeric: true,
  caseFirst: "upper"
});

/** @type {Array<Target>} */
const virtualTargets = [
  {
    name: "[North]",
    id: "N",
    latitude: 90,
    longitude: 0,
    altitude: 0,
    distance: null,
    virtual: true
  }
]

/**
 * Comparator function for targets
 * @param {Target} a first target
 * @param {Target} b second target
 * @returns {number} comparison result
 */
function compareTargets(a, b) {
  if (a.distance !== b.distance) {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;

    return a.distance < b.distance ? -1 : 1;
  }

  return collator.compare(a.name, b.name);
}

/**
 * Calculates trackable points on earth
 * @param {Map<string, import("utils/habhub").Coordinates>} flighs flights from habhub
 * @param {GeolocationCoordinates?} coordinates user coordinates, for sorting
 * @param {boolean} loading whether flighs are still actively loading
 * @returns {Array<Target>} targets
 */
export function computeTargets(flighs, coordinates, loading) {
  if (loading) {
    return []; // Don't show virtual targets until flights load or error out
  }

  /** @type {Array<Target>} */
  var balloons = Array.from(flighs.values()).map(f => ({
    name: f.vehicle,
    id: f.vehicle,
    latitude: f.latitude,
    longitude: f.longitude,
    altitude: f.altitude,
    distance: null,
    virtual: false
  }));

  if (coordinates != null) {
    coordinates = { latitude: coordinates.latitude, longitude: coordinates.longitude }; // geolib requires own properties

    for (var balloon of balloons) {
      balloon.distance = getDistance(balloon, coordinates);
    }
  }

  balloons.sort(compareTargets);

  return [...virtualTargets, ...balloons];
}

/**
 * Get object from targets based on last selected key
 * @param {Array<Target>} targets possible targets to pick from
 * @param {string?} selection user selected key, may not exist in targets
 * @returns {Target?} selected element
 */
export function getSelectedTarget(targets, selection) {
  if (selection != null && !targets.some(t => collator.compare(t.id, selection) === 0)) {
    selection = null;
  }

  if (selection == null) {
    var target = targets.find(t => !t.virtual);

    if (target == null) {
      target = targets[0];
    }

    return target || null;
  }

  return targets.find(t => collator.compare(t.id, selection) === 0);
}