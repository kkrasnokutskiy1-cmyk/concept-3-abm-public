import { lazy, Suspense } from 'react';
import { MotionConfig } from 'motion/react';
import {
  TopBar,
  Header,
  HeroCarousel,
  AttentionBanner,
  AwaitingDecision,
  DaySummary,
  TasksInProgress,
  WorldAround,
  PaymentCalendar,
  AiInsight,
  CashOnDate,
  BalanceForecast,
  CashCushion,
  MonthBenefit,
  MonthOverMonth,
  PaymentCheck,
  PlanFact,
  TaxesEns,
  CashFlow,
  KeyRateImpact,
  Counterparties,
  PayrollDay,
  SuggestedRule,
  BottomBar,
} from './components';

// Прежний прототип (экран 3892:210354) остаётся доступен по /?version=prev
const LegacyApp = lazy(() => import('./LegacyApp'));
const isPrevVersion = new URLSearchParams(window.location.search).get('version') === 'prev';

// Порядок блоков = порядок детей фрейма Main (3930:212853) в Figma.
function MainFull() {
  return (
    <MotionConfig reducedMotion="user">
      {/* На десктопе — корпус телефона 393×852 (global.css), на мобильном — обычный экран */}
      <div className="phone-frame">
        <div className="app">
          <main className="app__content">
            <TopBar />
            <Header />
            <HeroCarousel />
            <AttentionBanner />
            <AwaitingDecision />
            <DaySummary />
            <TasksInProgress />
            <WorldAround />
            <PaymentCalendar />
            <AiInsight />
            <CashOnDate />
            <BalanceForecast />
            <CashCushion />
            <MonthBenefit />
            <MonthOverMonth />
            <PaymentCheck />
            <PlanFact />
            <TaxesEns />
            <CashFlow />
            <KeyRateImpact />
            <Counterparties />
            <PayrollDay />
            <SuggestedRule />
          </main>
          <BottomBar />
        </div>
      </div>
    </MotionConfig>
  );
}

export default function App() {
  if (isPrevVersion) {
    return (
      <Suspense fallback={null}>
        <LegacyApp />
      </Suspense>
    );
  }
  return <MainFull />;
}
