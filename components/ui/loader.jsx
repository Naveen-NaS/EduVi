"use client";

import React from "react";

export default function Loader({ fullscreen = true, label = "Loading..." }) {
  const Wrapper = ({ children }) => (
    <div
      className={
        fullscreen
          ? "fixed inset-0 grid place-items-center bg-white/80 dark:bg-black/60 backdrop-blur-sm z-[9999]"
          : "w-full h-full grid place-items-center"
      }
    >
      {children}
    </div>
  );

  return (
    <Wrapper>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
      </div>
    </Wrapper>
  );
}
