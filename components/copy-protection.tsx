"use client"

import { useEffect } from "react"

export function CopyProtection() {
  useEffect(() => {
    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Prevent keyboard shortcuts for copy/cut/paste
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A
      if (e.ctrlKey && ['c', 'x', 'v', 'a', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
      
      // Prevent Ctrl+U (view source)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault()
      }
      
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault()
      }
    }

    // Prevent text selection
    const preventSelection = (e: Event) => {
      if (window.getSelection && window.getSelection()?.toString().length > 0) {
        window.getSelection()?.removeAllRanges()
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', preventSelection)
    document.addEventListener('mouseup', preventSelection)

    // Add CSS to prevent text selection
    const style = document.createElement('style')
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* Allow selection in input/textarea for forms if needed */
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `
    document.head.appendChild(style)

    // Blur content when user tries to inspect
    const handleBlur = () => {
      document.body.style.filter = 'blur(5px)'
    }

    const handleFocus = () => {
      document.body.style.filter = 'none'
    }

    // Monitor for dev tools opening
    const devToolsCheck = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        handleBlur()
        // Redirect after 2 seconds if dev tools remain open
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
    }

    // Check periodically
    const interval = setInterval(devToolsCheck, 1000)

    return () => {
      // Cleanup
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', preventSelection)
      document.removeEventListener('mouseup', preventSelection)
      document.head.removeChild(style)
      clearInterval(interval)
      document.body.style.filter = 'none'
    }
  }, [])

  return null
}