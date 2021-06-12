import React from 'react';

import "components/BottomButton.css";

/**
 * A button that changes where north is. Magic!
 * @param {Object} props the properties of the component
 * @param {string} props.label the text shown on the button
 * @param {() => void} props.onPress callback when the button gets pressed
 * @returns {JSX.Element}
 */
export default function BottomButton({ label, onPress }) {
  return (
    <button id="bottom-button" onClick={onPress}>
      {label}
    </button>
  );
}