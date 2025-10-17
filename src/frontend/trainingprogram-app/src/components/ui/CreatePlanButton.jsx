import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

function CreatePlanButton() {
  return (
    <Link
      to="/create-plan"
      className="fixed bottom-30 right-6 md:bottom-8 md:right-8 
                 flex items-center justify-center 
                 w-16 h-16 bg-[#B2E642] rounded-full text-[#111827] 
                 shadow-lg hover:bg-[#81ad22] transition-all duration-300 transform hover:scale-110"
    >
        <FontAwesomeIcon icon={faPlus} className="text-xl"/>
    </Link>
  );
}

export default CreatePlanButton;
