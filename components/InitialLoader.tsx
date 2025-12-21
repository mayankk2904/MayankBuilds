// components/InitialLoader.tsx - Alternative simpler version
"use client"

import { useEffect, useState } from "react"
import CombinedLoader from "./CombinedLoader"

export default function InitialLoader({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const startTime = Date.now()
    const minimumDuration = 2500// 4 seconds minimum
    
    // Calculate how long to wait to reach minimum duration
    const checkAndHide = () => {
      const elapsed = Date.now() - startTime
      if (elapsed >= minimumDuration) {
        setLoading(false)
      } else {
        // Wait the remaining time
        setTimeout(() => setLoading(false), minimumDuration - elapsed)
      }
    }
    
    // Text loader animation is 4 seconds, wait for it to complete
    const timer = setTimeout(checkAndHide, 2500) // 4.5 seconds to be safe
    
    // Safety timeout
    const safetyTimer = setTimeout(() => {
      setLoading(false)
    }, 10000) // Maximum 10 seconds

    return () => {
      clearTimeout(timer)
      clearTimeout(safetyTimer)
    }
  }, [])

  return (
    <>
      {/* APP ALWAYS RENDERS */}
      {children}

      {/* LOADER OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
          <CombinedLoader />
        </div>
      )}
    </>
  )
}