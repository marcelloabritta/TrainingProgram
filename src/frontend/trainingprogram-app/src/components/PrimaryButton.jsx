import React from 'react'

function PrimaryButton({children, onCLick, type = 'submit', className=""}) {
  const defaultClasses = "rounded-md bg-[#B2E642] font-bold text-[#111827] p-2 cursor-pointer hover:bg-[#81ad22] transition-colors duration-300 ease-in-out";
  return (
    <button 
    type={type}
    onClick={onCLick}
    className={`${defaultClasses} ${className}`}>
        {children}
    </button>
  )
}

export default PrimaryButton
