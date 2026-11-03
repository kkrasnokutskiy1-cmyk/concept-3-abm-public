import { decisions } from "../data/demoContent"

export type DecisionResult = {
  id: string
  verb: string
}

export type ScreenState = {
  activeBank: string
  alertOpen: boolean
  armedDecision: string | null
  completed: DecisionResult[]
}

export type ScreenAction =
  | { type: "bank/select"; id: string }
  | { type: "alert/toggle" }
  | { type: "decision/arm"; id: string }
  | { type: "decision/complete"; id: string; verb: string }
  | { type: "decision/undo" }

export const initialScreenState: ScreenState = {
  activeBank: "alfa",
  alertOpen: false,
  armedDecision: null,
  completed: [],
}

export function screenReducer(state: ScreenState, action: ScreenAction): ScreenState {
  switch (action.type) {
    case "bank/select":
      return { ...state, activeBank: action.id }
    case "alert/toggle":
      return { ...state, alertOpen: !state.alertOpen }
    case "decision/arm":
      return { ...state, armedDecision: action.id }
    case "decision/complete":
      if (state.completed.some((item) => item.id === action.id)) return state
      return {
        ...state,
        armedDecision: null,
        completed: [...state.completed, { id: action.id, verb: action.verb }],
      }
    case "decision/undo":
      return { ...state, completed: state.completed.slice(0, -1) }
    default:
      return state
  }
}

export function remainingDecisions(state: ScreenState) {
  return decisions.filter((decision) => !state.completed.some((item) => item.id === decision.id))
}
