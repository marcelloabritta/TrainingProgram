import React from "react";
import { Link } from "react-router-dom";

function SecondaryLink({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`${"text-white hover:text-[#B2E642] transition-colors duration-300 ease-in-out mt-1 mb-0 text-xs underline cursor-pointer"} ${className}`}
    >
      {children}
    </Link>
  );
}

export default SecondaryLink;
