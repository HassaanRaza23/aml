import React from "react";

export const Card = ({ children, className }) => (
  <div className={`border rounded-lg shadow p-4 bg-white ${className || ""}`}>
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="mt-2">{children}</div>
);
