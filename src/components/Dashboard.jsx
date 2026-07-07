import { fmt, barColor, daysLeftInMonth } from '../utils'
import { QUICK_ADDS } from '../seed'
import CategoryBar from './CategoryBar'
import SpendingChart from './SpendingChart'

export default function Dashboard({ budgets, monthExpenses, month, isCurrentMonth, onQuickAdd }) {
  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0)
  const totalSpent = monthExpenses.reduce((a, e) => a + e.amount, 0)
  const remaining = totalBudget - totalSpent
  const totalPct = totalBudget > 0 ? totalSpent / totalBudget : 0

  const daysLeft = daysLeftInMonth()
  const safePerDay = isCurrentMonth && remaining > 0 ? remaining / daysLeft : null

  const catSpend = {}
  monthExpenses.forEach(e => {
    catSpend[e.category] = (catSpend[e.category] || 0) + e.amount
  })

  return (
    <div className="dashboard">
      {/* ── Hero summary card ── */}
      <div className="card summary-card">
        <div className="summary-row">
          <div className="summary-col">
            <div className="sum-label">Spent</div>
            <div className="sum-val">{fmt(totalSpent)}</div>
          </div>
          <div className="sum-divider" />
          <div className="summary-col">
            <div className="sum-label">Budget</div>
            <div className="sum-val">{fmt(totalBudget)}</div>
          </div>
          <div className="sum-divider" />
          <div className="summary-col">
            <div className="sum-label">Left</div>
            <div className={`sum-val ${remaining < 0 ? 'sum-over' : 'sum-good'}`}>
              {remaining < 0 ? '-' : ''}{fmt(Math.abs(remaining))}
            </div>
          </div>
        </div>

        <div className="hero-bar-wrap">
          <div className="hero-bar">
            <div
              className="hero-fill"
              style={{ width: `${Math.min(100, totalPct * 100)}%`, background: barColor(totalPct) }}
            />
          </div>
          <span className="hero-pct">{Math.round(totalPct * 100)}%</span>
        </div>

        {safePerDay !== null && (
          <div className="safe-row">
            <span className="safe-label">Safe to spend</span>
            <span className="safe-value">
              {fmt(safePerDay)}<span className="safe-unit">/day</span>
            </span>
            <span className="safe-days">{daysLeft}d left</span>
          </div>
        )}
        {isCurrentMonth && remaining <= 0 && (
          <div className="safe-row over-alert">
            Over budget by {fmt(Math.abs(remaining))}
          </div>
        )}
      </div>

      {/* ── Quick-add shortcuts (current month only) ── */}
      {isCurrentMonth && (
        <div className="card">
          <div className="card-title">Quick Add</div>
          <div className="quick-grid">
            {QUICK_ADDS.map(qa => (
              <button
                key={qa.label}
                className="btn-quick"
                onClick={() => onQuickAdd(qa)}
              >
                <span className="quick-label">{qa.label}</span>
                <span className="quick-amt">{fmt(qa.amount)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Per-category breakdown ── */}
      <div className="card">
        <div className="card-title">By Category</div>
        {Object.entries(budgets).map(([cat, budget]) => (
          <CategoryBar
            key={cat}
            category={cat}
            spent={catSpend[cat] || 0}
            budget={budget}
          />
        ))}
      </div>

      {/* ── Charts ── */}
      <SpendingChart
        budgets={budgets}
        catSpend={catSpend}
        monthExpenses={monthExpenses}
        month={month}
      />

    </div>
  )
}
