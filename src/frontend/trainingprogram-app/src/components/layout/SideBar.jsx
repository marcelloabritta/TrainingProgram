import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import Logo from '../../assets/logo.png';
import { faArrowRightFromBracket, faChartSimple, faFolder } from "@fortawesome/free-solid-svg-icons";
import NavButton from "./NavButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return (
    <aside className="hidden md:flex flex-col p-6 bg-[#111827] text-white h-full md:w-64">
      <div className="flex items-center gap-2 mb-10">
        <img src={Logo} alt="Logo" className="h-10 w-10" />
        <span className="font-bold text-xl">Training <br/> Program</span>
      </div>
      <nav className="flex flex-col gap-4 flex-grow">
        <NavButton to="/dashboard" icon={faFolder} label="Plans" isActive={currentPath === '/dashboard'} />
        <NavButton to="/analytics" icon={faChartSimple} label="Analytics" isActive={currentPath === '/analytics'} />
      </nav>

       <button onClick={handleLogout} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default SideBar;
