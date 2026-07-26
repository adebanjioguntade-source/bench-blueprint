import { useEffect, useState, useRef, useCallback } from 'react'
import { saveSectionEntry } from '@/app/actions/workbook'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed'

export function useAutosave(
  sectionId: string,
  data: any,
  status: 'not_started' | 'in_progress' | 'complete'
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const lastSavedDataStrRef = useRef<string>(JSON.stringify(data))
  const dataRef = useRef(data)
  const statusRef = useRef(status)

  // Keep references current to prevent unnecessary refires
  useEffect(() => {
    dataRef.current = data
    statusRef.current = status
  }, [data, status])

  const performSave = useCallback(async (saveData: any, saveStatusVal: typeof status) => {
    const dataStr = JSON.stringify(saveData)
    // Avoid double saving identical state
    if (dataStr === lastSavedDataStrRef.current) {
      return
    }

    setSaveStatus('saving')

    // Handle offline status
    if (typeof window !== 'undefined' && !navigator.onLine) {
      localStorage.setItem(
        `bb:pending:${sectionId}`,
        JSON.stringify({ data: saveData, status: saveStatusVal })
      )
      setSaveStatus('saved') // offline backup queued
      return
    }

    try {
      const result = await saveSectionEntry(sectionId, saveData, saveStatusVal)
      if (result.success) {
        lastSavedDataStrRef.current = dataStr
        setSaveStatus('saved')
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`bb:pending:${sectionId}`)
        }
      } else {
        setSaveStatus('failed')
      }
    } catch (err) {
      console.error(`[useAutosave] Save failed for section ${sectionId}:`, err)
      setSaveStatus('failed')
    }
  }, [sectionId])

  // Debounced trigger after edits pause (800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSave(dataRef.current, statusRef.current)
    }, 800)

    return () => clearTimeout(timer)
  }, [data, performSave])

  const saveImmediately = useCallback(() => {
    performSave(dataRef.current, statusRef.current)
  }, [performSave])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveImmediately()
      }
    }

    const handleBeforeUnload = () => {
      saveImmediately()
    }

    const handleOnline = () => {
      if (typeof window !== 'undefined') {
        const pendingStr = localStorage.getItem(`bb:pending:${sectionId}`)
        if (pendingStr) {
          try {
            const { data: pData, status: pStatus } = JSON.parse(pendingStr)
            performSave(pData, pStatus)
          } catch (e) {
            console.error('[useAutosave] Failed to parse offline data:', e)
          }
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('online', handleOnline)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('online', handleOnline)
      }
      saveImmediately() // commit unsaved state on unmount
    }
  }, [saveImmediately, sectionId, performSave])

  return { saveStatus, saveImmediately }
}
