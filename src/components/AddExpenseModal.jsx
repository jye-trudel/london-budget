import { useState, useEffect } from 'react'
import { getLocalDate } from '../utils'

export default function AddExpenseModal({ mode, expense, prefill, budgets, onSave, onDelete, onClose }) {
  const todayDate = getLocalDate()
  const categories = Object.keys(budgets)

  const resolveCategory = (cat) =>
    cat && budgets[cat] !== undefined ? cat : categories[0] || ''

  const [form, setForm] = useState({
    amount: expense?.amount != null ? expense.amount.toFixed(2) : prefill?.amount != null ? String(prefill.amount) : '',
    category: resolveCategory(expense?.category ?? prefill?.category),
    date: expense?.date ?? todayDate,
    note: expense?.note ?? '',
  })
  const [error, setError] = useState('')

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function handleSave() {
    const amount = parseFloat(form.amount)
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount greater than £0')
      return
    }
    if (!form.category) {
      setError('Select a category')
      return
    }
    if (!form.date) {
      setError('Select a date')
      return
    }
    onSave({ amount, category: form.category, date: form.date, note: form.note.trim() })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label htmlFor="amt">Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">£</span>
              <input
                id="amt"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                step="0.01"
                min="0.01"
                autoFocus
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="cat">Category</label>
            <select id="cat" value={form.category} onChange={e => set('category', e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="dt">Date</label>
            <input
              id="dt"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              max={todayDate}
            />
          </div>

          <div className="field">
            <label htmlFor="note">Note <span className="label-optional">(optional)</span></label>
            <input
              id="note"
              type="text"
              placeholder="e.g. Sainsbury's weekly shop"
              value={form.note}
              onChange={e => set('note', e.target.value)}
            />
          </div>

          {error && <p className="field-error">{error}</p>}
        </div>

        <div className="modal-footer">
          {onDelete && (
            <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {mode === 'edit' ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
