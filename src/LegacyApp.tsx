import { useEffect, useReducer } from "react"

import { BottomNav } from "./components/screen/BottomNav"
import { LongSections } from "./components/screen/LongSections"
import { TopScreen } from "./components/screen/TopScreen"
import { initialScreenState, screenReducer } from "./model/screenState"
import "./styles/legacy-global.css"
import "./styles/screen.css"

/**
 * Прежний прототип (Figma 3892:210354, экран 393×852 в «телефонной» рамке).
 * Открывается по `/?version=prev`; стили грузятся отдельным чанком только здесь.
 */
export default function LegacyApp() {
  const [state, dispatch] = useReducer(screenReducer, initialScreenState)

  useEffect(() => {
    document.body.dataset.version = "prev"
    return () => {
      delete document.body.dataset.version
    }
  }, [])

  return (
    <main className="app-stage">
      <div className="phone-shell">
        <div className="dashboard-scroll">
          <TopScreen state={state} dispatch={dispatch} />
          <LongSections />
          <div className="scroll-end" aria-hidden="true" />
        </div>
        <BottomNav />
      </div>
    </main>
  )
}
