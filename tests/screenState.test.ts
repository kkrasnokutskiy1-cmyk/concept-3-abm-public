import { describe, expect, it } from "vitest"

import { initialScreenState, remainingDecisions, screenReducer } from "../src/model/screenState"

describe("screenReducer", () => {
  it("меняет выбранный банк и раскрывает контрольные оси", () => {
    const bank = screenReducer(initialScreenState, { type: "bank/select", id: "vtb" })
    const alert = screenReducer(bank, { type: "alert/toggle" })
    expect(alert.activeBank).toBe("vtb")
    expect(alert.alertOpen).toBe(true)
  })

  it("подтверждает решение один раз и возвращает последнее", () => {
    const completed = screenReducer(initialScreenState, { type: "decision/complete", id: "terminal", verb: "Подписать" })
    const duplicate = screenReducer(completed, { type: "decision/complete", id: "terminal", verb: "Подписать" })
    expect(remainingDecisions(completed)).toHaveLength(4)
    expect(duplicate.completed).toHaveLength(1)
    expect(screenReducer(completed, { type: "decision/undo" }).completed).toHaveLength(0)
  })
})
