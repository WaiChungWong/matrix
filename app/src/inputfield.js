import React from "react";
import PropTypes from "prop-types";

const InputField = ({ id, className, label, value, onChange }) => (
  <div className={className}>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="text"
      value={value}
      onKeyDown={event => {
        const keyCode = event.which || event.keyCode;

        if (keyCode === 38) {
          onChange(value + 1);
        } else if (keyCode === 40) {
          onChange(value - 1);
        }
      }}
      onChange={event => {
        const value = event.target.value;
        if (!/\D/.test(value)) {
          onChange(value);
        }
      }}
    />
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default InputField;
