import React from 'react'

function InputField({ label, type, placeholder, value, onChange}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-white">{label}</label>
          <input 
          type= {type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="rounded-md  bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#B2E642] pl-2 text-white p-1"/>
    </div>
  )
}

export default InputField
