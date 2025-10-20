import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function BackButton() {
  const navigate = useNavigate();

  // A função navigate(-1) é o jeito programático de dizer "volte uma página".
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleGoBack}
      className="text-white text-xl hover:text-[#B2E642] transition-colors cursor-pointer"
      aria-label="Go back to previous page"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
  );
}

export default BackButton;