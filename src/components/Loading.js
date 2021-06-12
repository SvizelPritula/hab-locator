import React from 'react';

import "components/Loading.css";

/**
 * Displays the "Waiting for X" messages over the compass
 * @param {Object} props the properties for the component
 * @param {string[]} props.items which items are still being loaded
 * @returns {JSX.Element}
 */
export default function Loading({ items }) {
  return (
    <div id="loading">
      {items.map(item => (
        <div key={item}>
          Waiting for {item}&#8230;
        </div>
      ))}
    </div>
  );
}