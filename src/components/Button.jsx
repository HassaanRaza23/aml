// components/Button.jsx
import React from "react";

export const Button = ({ children, onClick, className = "", type = "button" }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition ${className}`}
    >
      {children}
    </button>
  );
};
