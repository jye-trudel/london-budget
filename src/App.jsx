import { useState, useEffect } from 'react'
import { supabase, isConfigured } from './supabase'
import Dashboard from './components/Dashboard'
import ExpenseList from './components/ExpenseList'
import Settings from './components/Settings'
import AddExpenseModal from './components/AddExpenseModal'
import { DEFAULT_BUDGETS } from './seed'
import { getCurrentMonth, prevMonth, nextMonth, formatMonth, uid } from './utils'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [month, setMonth] = useState(getCurrentMonth)
  const [budgets, setBudgets] = useState({})
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState(null)
  const [modal, setModal] = useState(null)

  const currentMonth = getCurrentMonth()
  const isCurrentMonth = month === currentMonth
  const monthExpenses = expenses.filter(e => e.date.startsWith(month))

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }

    async function init() {
      try {
        const [{ data: bRows, error: bErr }, { data: eRows, error: eErr }] = await Promise.all([
          supabase.from('budgets').select('*'),
          supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        ])
        if (bErr) throw bErr
        if (eErr) throw eErr

        if (bRows.length === 0) {
          // First run — seed default budgets into Supabase
          const seed = Object.entries(DEFAULT_BUDGETS).map(([category, amount]) => ({ category, amount }))
          const { error } = await supabase.from('budgets').insert(seed)
          if (error) throw error
          setBudgets({ ...DEFAULT_BUDGETS })
        } else {
          const obj = {}
          bRows.forEach(r => { obj[r.category] = Number(r.amount) })
          setBudgets(obj)
        }

        setExpenses(
          eRows.map(r => ({
            id: r.id,
            amount: Number(r.amount),
            category: r.category,
            date: r.date,
            note: r.note || '',
          }))
        )
      } catch (err) {
        console.error('Load failed:', err)
        setSyncError('Could not connect to Supabase. Check your credentials and try refreshing.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  // Fire-and-forget helper: apply optimistic local update, then sync to Supabase.
  // On error, shows a banner (data is already updated locally; refresh re-syncs from DB).
  async function sync(op) {
    try {
      const { error } = await op()
      if (error) throw error
      setSyncError(null)
    } catch (err) {
      console.error('Sync error:', err)
      setSyncError('Last change may not have saved — check your connection.')
    }
  }

  // ── Budget mutations ────────────────────────────────────────────────────
  function updateBudget(cat, amt) {
    setBudgets(prev => ({ ...prev, [cat]: amt }))
    sync(() => supabase.from('budgets').upsert({ category: cat, amount: amt }))
  }
  function addCategory(cat, amt) {
    setBudgets(prev => ({ ...prev, [cat]: amt }))
    sync(() => supabase.from('budgets').insert({ category: cat, amount: amt }))
  }
  function deleteCategory(cat) {
    setBudgets(prev => { const n = { ...prev }; delete n[cat]; return n })
    sync(() => supabase.from('budgets').delete().eq('category', cat))
  }

  // ── Expense mutations ───────────────────────────────────────────────────
  function addExpense(data) {
    const id = uid()
    const exp = { ...data, id, note: data.note || '' }
    setExpenses(prev => [exp, ...prev])
    sync(() => supabase.from('expenses').insert(exp))
  }
  function updateExpense(id, data) {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
    sync(() => supabase.from('expenses').update({ ...data, note: data.note || '' }).eq('id', id))
  }
  function deleteExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id))
    sync(() => supabase.from('expenses').delete().eq('id', id))
  }

  // ── Not configured ──────────────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <div className="app-setup">
        <div className="setup-card">
          <div className="setup-icon">💷</div>
          <h1>London Budget</h1>
          <p>Supabase is not connected yet.</p>
          <p>
            Copy <code>.env.example</code> to <code>.env.local</code> and add your{' '}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
          </p>
          <p>Then restart the dev server.</p>
        </div>
      </div>
    )
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading your budget…</p>
      </div>
    )
  }

  // ── App ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {syncError && (
        <div className="sync-error-banner">
          ⚠️ {syncError}
          <button className="sync-error-close" onClick={() => setSyncError(null)}>✕</button>
        </div>
      )}

      <header className="app-header">
        <div className="header-left">
          <span className="app-icon" aria-hidden="true">💷</span>
          <span className="app-name">London Budget</span>
        </div>
        <div className="header-right">
          <div className="month-nav">
            <button
              className="month-arrow"
              onClick={() => setMonth(m => prevMonth(m))}
              aria-label="Previous month"
            >‹</button>
            <span className="month-label">{formatMonth(month)}</span>
            <button
              className="month-arrow"
              onClick={() => setMonth(m => nextMonth(m))}
              disabled={month >= currentMonth}
              aria-label="Next month"
            >›</button>
          </div>
          {isCurrentMonth && (
            <button
              className="btn-add-fab"
              onClick={() => setModal({ mode: 'add' })}
              aria-label="Add expense"
            >+</button>
          )}
        </div>
      </header>

      <main className="app-main">
        {tab === 'dashboard' && (
          <Dashboard
            budgets={budgets}
            monthExpenses={monthExpenses}
            month={month}
            isCurrentMonth={isCurrentMonth}
            onQuickAdd={prefill => setModal({ mode: 'add', prefill })}
          />
        )}
        {tab === 'expenses' && (
          <ExpenseList
            expenses={monthExpenses}
            allExpenses={expenses}
            onEdit={expense => setModal({ mode: 'edit', expense })}
            onDelete={deleteExpense}
          />
        )}
        {tab === 'settings' && (
          <Settings
            budgets={budgets}
            expenses={expenses}
            onUpdateBudget={updateBudget}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {[
          { id: 'dashboard', icon: '📊', label: 'Overview' },
          { id: 'expenses', icon: '🧾', label: 'Expenses' },
          { id: 'settings', icon: '⚙️', label: 'Settings' },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            className={tab === id ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>

      {modal && (
        <AddExpenseModal
          mode={modal.mode}
          expense={modal.expense}
          prefill={modal.prefill}
          budgets={budgets}
          onSave={data => {
            if (modal.mode === 'edit') updateExpense(modal.expense.id, data)
            else addExpense(data)
            setModal(null)
          }}
          onDelete={
            modal.mode === 'edit'
              ? () => { deleteExpense(modal.expense.id); setModal(null) }
              : null
          }
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
