import React from 'react';

export default function SuperSapiensIcon({ className = "w-4 h-4", style = {} }) {
  return (
    <img
      src="/supersapiens-logo.png"
      alt="SuperSapiens"
      className={`${className} object-contain rounded-full bg-[#071D41] p-[1px] ring-1 ring-white/60`}
      style={style}
    />
  );
}
