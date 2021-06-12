/**
* Format an angle in degrees
* @param {number} angle the angle to format
* @returns {string} the formatted string
*/
export function formatAngle(angle) {
  angle = Math.round(angle);
  angle %= 360;
  if (angle < 0) angle += 360;
  return `${angle}°`;
}

/**
* Format a distance in meters
* @param {number} distance the distance to format
* @param {boolean} fractional whether the supplied distance has sub-meter precision
* @returns {string} the formatted string
*/
export function formatDistance(distance, fractional = true) {
  if (distance >= 100000) { // 123km
    return `${(distance / 1000).toFixed(0)} km`;
  } else if (distance >= 1000) { // 12.3km, 1.2km
    return `${(distance / 1000).toFixed(1)} km`;
  } else if (distance >= 100) { // 123m
    return `${(distance).toFixed(0)} m`;
  } else { // 12.3m, 1.2m
    return `${(distance).toFixed(fractional ? 1 : 0)} m`;
  }
}

/**
 * Formats either latitude or longitude
 * @param {number} value the value to format 
 * @param {[string, string]} directions the prefix letter for positive and negative coordinates, respectively
 */
function formatCoordinateKey(value, directions) {
  var parts = [];

  parts.push(directions[Number(value < 0)]);
  value = Math.abs(value);

  parts.push(Math.floor(value).toString() + '°'); // Degrees
  value %= 1;
  value *= 60;

  parts.push(Math.floor(value).toString().padStart(2, '0') + '\u2032'); // Minutes
  value %= 1;
  value *= 60;

  parts.push(Math.floor(value).toString().padStart(2, '0') + '\u2033'); // Seconds

  return parts.join(' ');
}

/**
* Format geographical coordinates
* @param {{latitude: number, longitude: number, altitude: number?}} coords the coordinates to format
* @returns {string} the formatted string
*/
export function formatCoordinates(coords) {
  var lat = formatCoordinateKey(coords.latitude, ['N', 'S']);
  var lon = formatCoordinateKey(coords.longitude, ['E', 'W']);

  var parts = [lat, lon];

  if (coords.altitude != null) {
    parts.push(formatDistance(coords.altitude, false));
  }

  return parts.join(', ');
}