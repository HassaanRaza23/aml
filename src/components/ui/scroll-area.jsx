import React from "react";

export const ScrollArea = ({ children, className }) => (
  <div className={`overflow-y-auto max-h-[400px] ${className || ""}`}>
    {children}
  </div>
);
