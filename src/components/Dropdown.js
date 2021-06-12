import React from 'react';

import "components/Dropdown.css";

/**
 * A dropdown for selecting tracked target
 * @param {Object} props the properties of the component
 * @param {Array<import("utils/targets").Target>} props.targets possible targets to pick from
 * @param {import("utils/targets").Target} props.target the currently selected target, should be one of targets
 * @param {(target: string) => void} props.setTarget callback when a new target gets selected, with its id as the callback parameter
 * @param {Array<{type: "error"|"warning", error: string, id: string}>} props.errors errors to display bellow dropdown
 * @returns {JSX.Element}
 */
export default function Dropdown({ targets, target, setTarget, errors }) {
  return (
    <div id="header">
      <select
        id="dropdown"
        value={target ? target.id : ""}
        disabled={targets.length === 0}
        onChange={event => setTarget(event.target.value)}
        aria-label="Tracked target"
      >
        {targets.length === 0 && (
          <option>Loading&#8230;</option>
        )}
        {targets.map(t => (
          <option
            value={t.id}
            key={t.id}
          >{t.name}</option>
        ))}
      </select>

      {errors.map(error => (
        <div className={error.type} key={error.id}>
          <b>{{ error: "Error", warning: "Warning" }[error.type]}:</b> {error.error}
        </div>
      ))}
    </div>
  );
}