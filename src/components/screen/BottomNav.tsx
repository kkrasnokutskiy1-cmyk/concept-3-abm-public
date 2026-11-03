const navItems = [
  ["home", "/assets/figma/nav-home.svg", "Главная", "top"],
  ["money", "/assets/figma/nav-ruble.svg", "Деньги", "calendar"],
  ["time", "/assets/figma/nav-clock.svg", "Впереди", "ahead"],
  ["more", "/assets/figma/nav-grid.svg", "Все разделы", "sections"],
] as const

export function BottomNav() {
  const navigate = (id: string) => {
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"

    if (id === "top") {
      document.querySelector(".dashboard-scroll")?.scrollTo({ top: 0, behavior })
      return
    }

    document.getElementById(id)?.scrollIntoView({ behavior, block: "start" })
  }

  return (
    <nav className="bottom-nav" aria-label="Основная навигация" data-node-id="3892:211517">
      <div className="bottom-nav-actions">
        {navItems.map(([id, icon, label, target]) => (
          <button key={id} type="button" aria-label={label} onClick={() => navigate(target)} className="pressable">
            <img src={icon} alt="" width={id === "more" ? 32 : 28} height={id === "more" ? 32 : 28} />
          </button>
        ))}
      </div>
      <span className="home-indicator" aria-hidden="true" />
    </nav>
  )
}
