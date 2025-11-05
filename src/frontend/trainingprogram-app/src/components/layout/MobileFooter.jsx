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
    <footer className="flex justify-around items-center p-4 bg-[#111827] md:hidden">
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
    </footer>
  );
}

export default MobileFooter;
