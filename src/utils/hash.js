import { useEffect, useState } from "react";

const prefix = "#!";

/**
 * Find part of current URL following "#!", or null if it doesn't exist
 * @returns {string?} the current location hash, without "!"
 */
function getCurrentHash() {
  var hash = window.location.hash;

  if (hash.startsWith(prefix)) {
    return hash.slice(prefix.length);
  } else {
    return null;
  }
}

/**
 * Change the location hash to "!" + hash
 * @param {string} hash the new location hash, without "!"
 */
function changeCurrentHash(hash) {
  var url = new URL(window.location);
  url.hash = prefix + hash;
  window.location.replace(url);
}

/**
 * Use the location hash (aka anchor) prefixed with "!" as if with useState
 * @returns {[string, (hash: string) => void]} array of current hash and function to change it
 */
export function useLocationHash() {
  var [hash, setHash] = useState(getCurrentHash());

  useEffect(() => {
    function updateHash() {
      setHash(getCurrentHash());
    }

    updateHash(); // The hash *could* change between useState and useEffect callback

    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  return [hash, changeCurrentHash];
}