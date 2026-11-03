import { AnimatePresence, motion } from "motion/react"
import { useMemo, type Dispatch } from "react"

import { banks, decisions } from "../../data/demoContent"
import { usePointerGesture } from "../../hooks/usePointerGesture"
import {
  remainingDecisions,
  type ScreenAction,
  type ScreenState,
} from "../../model/screenState"
import { motionTokens } from "../../motion/tokens"

type TopScreenProps = {
  state: ScreenState
  dispatch: Dispatch<ScreenAction>
}

function StatusBar() {
  return (
    <div className="status-bar" aria-label="Статус iPhone: 9:41, сеть, Wi‑Fi, батарея">
      <span className="status-time">9:41</span>
      <span className="status-icons" aria-hidden="true">
        <span className="signal"><i /><i /><i /><i /></span>
        <span className="wifi"><i /></span>
        <span className="battery"><i /></span>
      </span>
    </div>
  )
}

function AssistantHeader() {
  return (
    <header className="assistant-header" data-node-id="3892:210355">
      <img className="top-star" src="/assets/figma/top-star.png" alt="" />
      <StatusBar />
      <div className="assistant-name">
        <img src="/assets/figma/ai-logo.svg" alt="" width="20" height="20" />
        <span>Альфа-Интеллект</span>
      </div>
    </header>
  )
}

function CompanySwitcher() {
  return (
    <section className="company-switcher" data-node-id="3892:210363" aria-label="Текущая компания">
      <div className="company-mark" aria-hidden="true">
        <img src="/assets/figma/company-avatar-mark.png" alt="" />
      </div>
      <button className="company-pill pressable" type="button" aria-label="Сменить компанию">
        <strong>Центрсвет Бутово</strong>
        <span>Финансовый эксперт</span>
      </button>
      <button className="circle-button pressable" type="button" aria-label="Уведомления">
        <img src="/assets/figma/bell.svg" alt="" width="18" height="18" />
      </button>
    </section>
  )
}

function MoneyCard({ state, dispatch }: TopScreenProps) {
  return (
    <section className="money-section" data-node-id="3892:210384">
      <div className="glass-card money-card">
        <div className="money-heading">
          <span>Деньги группы</span>
          <span className="money-delta">
            <img src="/assets/figma/trend-up.svg" alt="" width="8" height="8" />
            <strong>0,6 млрд</strong>
            <span>к вчера</span>
          </span>
        </div>
        <div className="money-value">12,84 млрд <span>₽</span></div>
        <div className="share-bar" aria-label="Распределение денег по банкам">
          {banks.map((bank) => (
            <span key={bank.id} style={{ flex: bank.share, background: bank.tone }} />
          ))}
        </div>
        <div className="bank-list">
          {banks.map((bank) => {
            const active = state.activeBank === bank.id
            return (
              <button
                key={bank.id}
                type="button"
                className="bank-row pressable"
                aria-pressed={active}
                onClick={() => dispatch({ type: "bank/select", id: bank.id })}
              >
                <span className="bank-dot" style={{ background: bank.tone }} />
                <strong>{bank.name}</strong>
                <span>{bank.value}</span>
                <img src="/assets/figma/arrow-up-right.svg" alt="" width="16" height="16" />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Pager() {
  return (
    <div className="pager" aria-label="Первый из четырёх блоков" data-node-id="3892:210447">
      <i className="active" /><i /><i /><i />
    </div>
  )
}

const attentionRows = [
  ["Ликвидность", "47 дней запаса", 2, 5],
  ["Ковенанты", "DSCR 1,38 к 31 дек", 4, 5],
  ["Валюта", "CNY −2,1 млрд", 2, 4],
  ["Контрагенты", "2 под наблюдением", 3, 5],
] as const

function Attention({ state, dispatch }: TopScreenProps) {
  return (
    <section className="attention-wrap" data-node-id="3892:210452">
      <div className={`glass-card attention ${state.alertOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="attention-trigger pressable"
          aria-expanded={state.alertOpen}
          onClick={() => dispatch({ type: "alert/toggle" })}
        >
          <span className="attention-copy">
            <strong><i />Внимание</strong>
            <span>Одна ось у порога: ковенант DSCR</span>
          </span>
          <img src="/assets/figma/chevron-down.svg" alt="" width="16" height="16" />
        </button>
        <div className="attention-details" inert={!state.alertOpen}>
          <div>
            {attentionRows.map(([name, value, filled, total]) => (
              <div className="axis-row" key={name}>
                <p><span>{name}</span><strong>{value}</strong></p>
                <div aria-hidden="true">
                  {Array.from({ length: total }, (_, index) => <i key={index} className={index < filled ? "filled" : ""} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DecisionCard({ state, dispatch }: TopScreenProps) {
  const queue = useMemo(() => remainingDecisions(state), [state])
  const top = queue[0]
  const last = state.completed[state.completed.length - 1]
  const gesture = usePointerGesture({
    direction: "negative",
    onCommit: (direction) => {
      if (direction < 0 && top) dispatch({ type: "decision/complete", id: top.id, verb: "Отложено до завтра" })
    },
  })

  const resolve = (primary: boolean) => {
    if (!top) return
    if (primary && top.confirm && state.armedDecision !== top.id) {
      dispatch({ type: "decision/arm", id: top.id })
      return
    }
    dispatch({
      type: "decision/complete",
      id: top.id,
      verb: primary ? top.primary : top.secondary,
    })
  }

  return (
    <section className="decision-section" id="decisions" data-node-id="3892:210463">
      <div className="section-title-row">
        <h2>Ждёт вашего решения</h2>
        <span className="count-badge">{queue.length}</span>
      </div>
      <div className="decision-stack">
        <AnimatePresence mode="popLayout" initial={false}>
          {top ? (
            <motion.article
              key={top.id}
              className={`glass-card decision-card ${gesture.active ? "is-dragging" : ""}`}
              initial={{ opacity: 0, transform: "translate3d(12px,0,0) scale(.98)" }}
              animate={{ opacity: 1, transform: "translate3d(0,0,0) scale(1)" }}
              exit={{ opacity: 0, transform: "translate3d(-110%,0,0) scale(.98)" }}
              transition={{ duration: motionTokens.duration.state, ease: motionTokens.easeOut }}
              {...gesture.bind}
            >
              <div className="decision-copy">
                <span>{top.company}</span>
                <strong>{top.amount.replace(" ₽", "")} <small>₽</small></strong>
                <p>{top.detail}</p>
              </div>
              <div className="decision-actions">
                <button className="button button-primary pressable" type="button" onClick={() => resolve(true)}>
                  {state.armedDecision === top.id ? top.confirm : top.primary}
                </button>
                <button className="button button-muted pressable" type="button" onClick={() => resolve(false)}>
                  {top.secondary}
                </button>
              </div>
            </motion.article>
          ) : (
            <motion.div className="glass-card decision-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Всё решено · следующая проверка 14:00
            </motion.div>
          )}
        </AnimatePresence>
        {queue[1] && <span className="stack-edge edge-one" aria-hidden="true" />}
        {queue[2] && <span className="stack-edge edge-two" aria-hidden="true" />}
      </div>
      {last && (
        <p className="undo-row" aria-live="polite">
          <span>{last.verb} · {decisions.find((item) => item.id === last.id)?.company}</span>
          <button type="button" onClick={() => dispatch({ type: "decision/undo" })}>Вернуть</button>
        </p>
      )}
    </section>
  )
}

export function TopScreen(props: TopScreenProps) {
  return (
    <>
      <AssistantHeader />
      <CompanySwitcher />
      <MoneyCard {...props} />
      <Pager />
      <Attention {...props} />
      <DecisionCard {...props} />
    </>
  )
}
