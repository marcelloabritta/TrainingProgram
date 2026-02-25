import {
  faBook,
  faChartSimple,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import NavButton from "./NavButton";

function MobileFooter({ currentPath }) {
  return (
    <footer
      className="md:hidden"
      style={{
        background: "linear-gradient(180deg, #0f1623 0%, #111827 100%)",
        borderTop: "1px solid rgba(178,230,66,0.08)",
        paddingTop: "10px",
        paddingBottom: "calc(18px + env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex justify-around items-start max-w-md mx-auto px-2">
        <NavButton
          to="/dashboard"
          icon={faFolder}
          label="Plans"
          isActive={currentPath === "/dashboard"}
        />
        <NavButton
          to="/analytics"
          icon={faChartSimple}
          label="Analytics"
          isActive={currentPath === "/analytics"}
        />
        <NavButton
          to="/library"
          icon={faBook}
          label="Library"
          isActive={currentPath === "/library"}
        />
      </div>
    </footer>
  );
}

export default MobileFooter;
