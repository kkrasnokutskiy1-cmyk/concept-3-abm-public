import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"

type GestureOptions = {
  axis?: "x" | "y"
  threshold?: number
  velocityThreshold?: number
  direction?: "negative" | "positive" | "both"
  onCommit: (direction: -1 | 1) => void
}

export function usePointerGesture({
  axis = "x",
  threshold = 90,
  velocityThreshold = 0.45,
  direction = "both",
  onCommit,
}: GestureOptions) {
  const element = useRef<HTMLElement | null>(null)
  const start = useRef<{ id: number; value: number; time: number } | null>(null)
  const offset = useRef(0)
  const [active, setActive] = useState(false)

  const reset = () => {
    if (element.current) {
      element.current.style.transition = "transform var(--duration-ui) var(--ease-out)"
      element.current.style.transform = "translate3d(0,0,0)"
    }
    start.current = null
    offset.current = 0
    setActive(false)
  }

  useEffect(() => reset, [])

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
    if (start.current || event.pointerType === "mouse" && event.button !== 0) return
    const value = axis === "x" ? event.clientX : event.clientY
    start.current = { id: event.pointerId, value, time: performance.now() }
    element.current = event.currentTarget
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.style.transition = "none"
    setActive(true)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = start.current
    if (!current || current.id !== event.pointerId) return
    const raw = (axis === "x" ? event.clientX : event.clientY) - current.value
    const allowed = direction === "both" || direction === "negative" && raw <= 0 || direction === "positive" && raw >= 0
    const value = allowed ? raw : raw * 0.16
    offset.current = value
    event.currentTarget.style.transform = axis === "x"
      ? `translate3d(${value}px,0,0)`
      : `translate3d(0,${value}px,0)`
  }

  const finish = (event: ReactPointerEvent<HTMLElement>) => {
    const current = start.current
    if (!current || current.id !== event.pointerId) return
    const elapsed = Math.max(1, performance.now() - current.time)
    const velocity = Math.abs(offset.current) / elapsed
    const accepted = Math.abs(offset.current) >= threshold || velocity >= velocityThreshold
    const gestureDirection = offset.current < 0 ? -1 : 1
    if (accepted) onCommit(gestureDirection)
    reset()
  }

  return {
    active,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  }
}
