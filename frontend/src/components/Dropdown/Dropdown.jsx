import React, { useState, useEffect, useRef } from 'react'
import "./Dropdown.css"

function Dropdown({name,items, val}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(null) 
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if(dropdownRef.current) {
        if(!dropdownRef.current.contains(e.target)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('click', handler)

    return () => {
      document.removeEventListener('click', handler)
    }
  })

  return (
    <div className='dropdown' ref={dropdownRef}>
      <button 
        type="button"
        className='toggle'
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        <span>{selected ? selected : name}</span>
      </button>

      <div className={`options ${isOpen ? "visible" : ""}`}>
        {items.map((item, id) => {
          return (
            <button 
              type="button"
              key={id}
              onClick={() => {
                setSelected(item)
                val(item)
                setIsOpen(false)
              }}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Dropdown
