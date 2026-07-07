import { fmt, formatShortDate, toCSV } from '../utils'

function downloadCSV(expenses) {
  const csv = toCSV(expenses)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'expenses.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExpenseList({ expenses, onEdit, onDelete, allExpenses }) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))

  // Group by date
  const groups = []
  const seen = {}
  sorted.forEach(e => {
    if (!seen[e.date]) {
      seen[e.date] = []
      groups.push({ date: e.date, items: seen[e.date] })
    }
    seen[e.date].push(e)
  })

  const monthTotal = sorted.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="expense-list">
      <div className="expense-list-top">
        <span className="expense-count">
          {sorted.length} {sorted.length === 1 ? 'expense' : 'expenses'} · {fmt(monthTotal)}
        </span>
        <button className="btn-link" onClick={() => downloadCSV(allExpenses)}>
          Export CSV ↓
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <p>No expenses this month yet.</p>
          <p className="empty-sub">Tap <strong>+</strong> in the header to add one.</p>
        </div>
      ) : (
        groups.map(({ date, items }) => (
          <div key={date} className="expense-group">
            <div className="group-date-label">{formatShortDate(date)}</div>
            {items.map(expense => (
              <div
                key={expense.id}
                className="expense-item"
                onClick={() => onEdit(expense)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onEdit(expense)}
              >
                <div className="ei-left">
                  <span className="ei-cat">{expense.category}</span>
                  {expense.note ? (
                    <span className="ei-note">{expense.note}</span>
                  ) : null}
                </div>
                <div className="ei-right">
                  <span className="ei-amt">{fmt(expense.amount)}</span>
                  <button
                    className="btn-del"
                    aria-label="Delete expense"
                    onClick={e => {
                      e.stopPropagation()
                      onDelete(expense.id)
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
