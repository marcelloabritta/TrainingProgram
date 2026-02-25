import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link } from 'react-router-dom'

function NavButton({ to, icon, label, isActive }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 pt-1 pb-0.5 px-5 relative transition-all duration-200"
      style={{
        color: isActive ? '#B2E642' : '#5a6d85',
        transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {/* Active indicator bar at top */}
      {isActive && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 24,
            height: 3,
            background: 'linear-gradient(90deg, #B2E642, #91c035)',
            borderRadius: '0 0 4px 4px',
          }}
        />
      )}
      <FontAwesomeIcon
        icon={icon}
        style={{
          fontSize: isActive ? '2rem' : '1.75rem',
          transition: 'all 0.2s ease',
        }}
      />
      <span
        style={{
          fontSize: '0.82rem',
          fontWeight: isActive ? 700 : 400,
          letterSpacing: isActive ? '0.06em' : '0.03em',
          textTransform: 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {label}
      </span>
    </Link>
  )
}

export default NavButton
