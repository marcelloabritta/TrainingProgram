import React from 'react'
import { twMerge } from './../../node_modules/tailwind-merge/src/lib/tw-merge';

function InputField({ label, type, placeholder, value, onChange, className= "", labelClassName=""}) {
  const defaultInputClasses = "rounded-md  bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#B2E642] pl-2 text-white p-1";
  const defaultLabelClasses = "text-[10px] font-medium text-white";
  return (
    <div className="flex flex-col gap-1">
      <label className={twMerge(defaultLabelClasses, labelClassName)}>{label}</label>
          <input 
          type= {type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={twMerge(defaultInputClasses, className)}/>
    </div>
  )
}

export default InputField
