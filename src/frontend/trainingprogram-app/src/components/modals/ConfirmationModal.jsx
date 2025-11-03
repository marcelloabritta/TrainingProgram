import React from 'react'

function ConfirmationModal({isOpen, onClose, onConfirm, title, message}) {
    if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-[#1F2937]/70 rounded-2xl flex justify-center items-center z-50"> 
      <div className="flex flex-col rounded-lg p-8 shadow-lg w-full max-w-sm bg-[#111827]">
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <p  className="text-gray-300 mb-8 ">{message}</p>
        <div className="flex justify-end gap-4">
            <button onClick={onClose} className="rounded-md bg-[#B2E642] font-bold text-[#111827] p-2 cursor-pointer hover:bg-[#81ad22] transition-colors duration-300 ease-in-out">Cancel</button>
            <button onClick={onConfirm} className="rounded-md bg-red-600 font-medium text-white p-2 cursor-pointer hover:bg-red-900 transition-colors duration-300 ease-in-out">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
