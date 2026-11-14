import { useEffect, useState } from 'react'

// Ignore an old response when a newer search or page request replaces it.
export function useFleetResource(load, revision, enabled = true) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, revision, data })
      },
      (error) => {
        if (!controller.signal.aborted)
          setResult({ load, revision, error: error.code ?? 'errorConnection' })
      },
    )
    return () => controller.abort()
  }, [load, revision, enabled])

  const current = result?.load === load && result.revision === revision
  return {
    loading: enabled && !current,
    data: current ? result.data : undefined,
    error: current ? result.error : undefined,
  }
}
