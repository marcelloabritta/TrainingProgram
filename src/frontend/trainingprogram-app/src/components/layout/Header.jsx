import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

function Header({title}) {
  return (
    <header className="flex justify-between items-center pt-10 p-4 bg-[#111827]">
      <h1 className="text-white text-2xl font-medium ml-2">{title}</h1>
      <FontAwesomeIcon
        className="text-[#B3C3D8] text-2xl cursor-pointer mr-2"
        icon={faGear}
      />
    </header>
  )
}

export default Header
