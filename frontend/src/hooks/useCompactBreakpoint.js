import { useEffect, useState } from 'react'

export default function useCompactBreakpoint(breakpoint = 1100) {
  const [isCompact, setIsCompact] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  )

  useEffect(() => {
    const update = () => {
      setIsCompact(prev => {
        const next = window.innerWidth <= breakpoint
        return next === prev ? prev : next
      })
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [breakpoint])

  return isCompact
}
