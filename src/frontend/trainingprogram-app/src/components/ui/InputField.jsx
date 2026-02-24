import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function InputField({ label, type, placeholder, value, onChange, className = "", labelClassName = "" }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const defaultInputClasses = "rounded-md bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#B2E642] pl-2 text-white p-1 w-full";
  const defaultLabelClasses = "text-[10px] font-medium text-white";

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={twMerge(defaultLabelClasses, labelClassName)}>{label}</label>
      <div className="relative flex items-center">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={twMerge(defaultInputClasses, className)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
          </button>
        )}
      </div>
    </div>
  )
}

export default InputField
