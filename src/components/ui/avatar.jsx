import React from "react";

export const Avatar = ({ children }) => (
  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm">
    {children}
  </div>
);

export const AvatarFallback = ({ children }) => (
  <span>{children}</span>
);
