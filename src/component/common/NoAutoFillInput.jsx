// src/component/common/NoAutoFillInput.jsx
import React from "react";

const NoAutoFillInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className = "",
  required = false,
  autoComplete = "off", // default
  ...props
}) => {
  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label htmlFor={name} className="font-semibold mb-1">
          {label} {required && "*"}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        {...props}
        className={`border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-yellow-500 ${className}`}
      />
    </div>
  );
};

export default NoAutoFillInput;

