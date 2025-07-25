
// AÇIQLAMA: Bu komponent artıq rəng dairələrini göstərməyi dəstəkləyir.
'use client'

import { useState, useEffect, useRef } from 'react'

export default function CustomSelect({ options, value, onChange, placeholder, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  const selectedOption = options.find(option => option.value === value)

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-200 disabled:cursor-not-allowed flex justify-between items-center"
      >
        <span className={`flex items-center ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption?.hex && <span className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: selectedOption.hex }}></span>}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div
            onClick={() => handleOptionClick('')}
            className="px-4 py-2 text-gray-700 hover:bg-indigo-50 cursor-pointer"
          >
            {placeholder}
          </div>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="px-4 py-2 text-gray-700 hover:bg-indigo-50 cursor-pointer flex items-center"
            >
              {option.hex && <span className="w-5 h-5 rounded-full mr-2 border-[0.5px]" style={{ backgroundColor: option.hex }}></span>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}