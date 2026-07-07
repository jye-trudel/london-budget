import { toCSV } from '../utils'
import { DEFAULT_BUDGETS } from '../seed'

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

export default function Settings({ expenses }) {
  return (
    <div className="settings-page">
      <div className="card">
        <div className="card-title">Export</div>
        <p className="settings-info">Download all your logged expenses as a CSV file.</p>
        <button className="btn btn-secondary btn-full" onClick={() => downloadCSV(expenses)}>
          Export all expenses to CSV ↓
        </button>
      </div>

      <div className="card">
        <div className="card-title">Data</div>
        <p className="settings-info">
          Your data is stored in Supabase (PostgreSQL). It persists across devices and sessions.
        </p>
      </div>
    </div>
  )
}
