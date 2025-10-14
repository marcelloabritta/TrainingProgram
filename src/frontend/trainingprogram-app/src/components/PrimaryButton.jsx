import React from 'react'

function PrimaryButton({children, onCLick, type = 'submit'}) {
  return (
    <button 
    type={type}
    onClick={onCLick}
    className="rounded-md bg-[#B2E642] font-bold text-[#111827] p-2 cursor-pointer hover:bg-[#81ad22] transition-colors duration-300 ease-in-out">
        {children}
    </button>
  )
}

export default PrimaryButton
