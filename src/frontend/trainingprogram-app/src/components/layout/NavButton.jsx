import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link } from 'react-router-dom'

function NavButton({to, icon, label, isActive}) {
    const colorClass= isActive ? "text-[#B2E642]" : "text-[#8DA0B9]"
  return (
   <Link to={to} className={`flex flex-col items-center gap-1 transition-colors ${colorClass} hover:text-[#82b319]`}>
    <FontAwesomeIcon icon={icon} className="text-5xl md:text-2xl" />
    <p className="text-sm">{label}</p>
</Link>

  )
}

export default NavButton
