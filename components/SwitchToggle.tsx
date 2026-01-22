"use client"

import React from "react"

interface SwitchToggleProps {
  isDarkMode: boolean
  onToggle: () => void
}

export function SwitchToggle({ isDarkMode, onToggle }: SwitchToggleProps) {
  // Calculate sizes based on a base scale
  const scale = 0.85 // Adjust this value to make it smaller (0.7, 0.6, etc.)
  
  const styles = {
    container: {
      position: 'relative' as const,
      display: 'inline-block',
      width: `${3.5 * scale}em`,
      height: `${1.8 * scale}em`,
      borderRadius: `${1.8 * scale}em`,
      boxShadow: '0 0 6px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
    },
    slider: {
      height: `${1.2 * scale}em`,
      width: `${1.2 * scale}em`,
      left: `${0.3 * scale}em`,
      transform: isDarkMode 
        ? 'translateY(-50%) translateX(0)' 
        : `translateY(-50%) translateX(${1.7 * scale}em)`,
    },
    star: {
      width: `${4 * scale}px`,
      height: `${4 * scale}px`,
    },
    cloud: {
      width: `${2.8 * scale}em`,
      bottom: `${-0.8 * scale}em`,
      left: `${-0.8 * scale}em`,
    }
  }

  return (
    <div style={styles.container}>
      <input
        id="theme-checkbox"
        type="checkbox"
        checked={isDarkMode}
        onChange={onToggle}
        aria-label="Toggle theme"
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          position: 'absolute' as const,
        }}
      />
      
      {/* Background */}
      <div
        onClick={onToggle}
        style={{
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? '#2a2a2a' : '#00a6ff',
          transition: 'background-color 0.3s ease',
          borderRadius: `${1.8 * scale}em`,
          overflow: 'hidden' as const,
        }}
      >
        {/* Slider circle */}
        <div
          style={{
            position: 'absolute' as const,
            borderRadius: '50%',
            top: '50%',
            ...styles.slider,
            transition: 'transform 0.3s cubic-bezier(0.81, -0.04, 0.38, 1.5)',
            boxShadow: isDarkMode 
              ? 'inset 6px -3px 0px 0px #fff'
              : 'inset 12px -3px 0px 12px #ffcf48',
            zIndex: 2,
          }}
        />
        
        {/* Stars - only visible in dark mode */}
        {isDarkMode && (
          <>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute' as const,
              left: `${2 * scale}em`,
              top: `${0.4 * scale}em`,
              opacity: 1,
              transition: 'opacity 0.3s ease',
              ...styles.star,
              zIndex: 1,
            }} />
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute' as const,
              left: `${1.7 * scale}em`,
              top: `${0.9 * scale}em`,
              opacity: 1,
              transition: 'opacity 0.3s ease',
              width: `${3 * scale}px`,
              height: `${3 * scale}px`,
              zIndex: 1,
            }} />
          </>
        )}
        
        {/* Cloud - only visible in light mode */}
        {!isDarkMode && (
          <svg 
            viewBox="0 0 16 16" 
            style={{
              position: 'absolute' as const,
              opacity: 1,
              transition: 'opacity 0.3s ease',
              ...styles.cloud,
              zIndex: 1,
            }}
          >
            <path
              transform="matrix(.77976 0 0 .78395-299.99-418.63)"
              fill="#fff"
              d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
            />
          </svg>
        )}
      </div>
    </div>
  )
}