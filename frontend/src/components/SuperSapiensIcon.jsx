import React from 'react';

export default function SuperSapiensIcon({ className = "w-4 h-4", style = {} }) {
  return (
    <img
      src="/supersapiens-logo.png"
      alt="SuperSapiens"
      className={`${className} object-contain rounded-sm`}
      style={style}
    />
  );
}
