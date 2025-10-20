import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import BackButton from '../ui/BackBotton'
import { useHeader } from '../../context/HeaderContext';

function Header() {
  const { title, showBackButton } = useHeader();
  return (
    <header className="flex justify-between items-center pt-13 p-4 bg-[#111827]">
      {showBackButton && <BackButton />}
      <h1 className="text-white text-2xl font-medium ml-2">{title}</h1>
      <FontAwesomeIcon
        className="text-[#B3C3D8] text-2xl cursor-pointer mr-2"
        icon={faGear}
      />
    </header>
  )
}

export default Header
