import { create } from 'mutative'
import { useEffect, useRef, useState } from 'react'
import bitsFetch from './bitsFetch'

export const FETCH_TIMEOUT = 180

export function useFetchCountdown(timeoutSeconds = FETCH_TIMEOUT) {
  const [countdown, setCountdown] = useState(0)
  const intervalRef = useRef(null)

  const clearCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCountdown(0)
  }

  const startCountdown = onTimeout => {
    clearCountdown()
    setCountdown(timeoutSeconds)
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          onTimeout && onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = sec => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { countdown, startCountdown, clearCountdown, formatTime }
}

export default function CustomFetcherHelper(
  isLoadingRef,
  entityId,
  controller,
  setIsLoading,
  removeAction,
  removeMethod = 'POST',
  key = 'triggered_entity_id'
) {
  const removeTestData = () => {
    if (!entityId) {
      return
    }

    bitsFetch({ [key]: entityId }, removeAction, null, removeMethod)
  }

  const stopFetching = () => {
    controller.abort()
    setIsLoading(false)
    isLoadingRef.current = false

    removeTestData()
  }

  return { stopFetching }
}

const resetActionHookFlowData = setFlow => {
  setFlow(prevFlow =>
    create(prevFlow, draftFlow => {
      delete draftFlow?.triggerDetail?.tmp
      delete draftFlow?.triggerDetail?.data
    })
  )
}

const startFetching = (
  isLoadingRef,
  setShowResponse,
  setPrimaryKey,
  setFlow,
  setIsLoading,
  isEdit = false
) => {
  setIsLoading(true)
  isLoadingRef.current = true
  setShowResponse(false)
  setPrimaryKey(undefined)
  resetFlowData(setFlow, isEdit)
}

const resetFlowData = (setFlow, isEdit = false) => {
  setFlow(prevFlow =>
    create(prevFlow, draftFlow => {
      const property = isEdit ? 'flow_details' : 'triggerDetail'

      delete draftFlow[property].data
    })
  )
}

export { startFetching, resetFlowData, resetActionHookFlowData }
