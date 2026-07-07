import { useState } from 'react'
import { fmt, toCSV } from '../utils'
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

export default function Settings({ budgets, expenses, onUpdateBudget, onAddCategory, onDeleteCategory }) {
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [newName, setNewName] = useState('')
  const [newAmt, setNewAmt] = useState('')
  const [addError, setAddError] = useState('')

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0)

  function startEdit(cat) {
    setEditing(cat)
    setEditVal(String(budgets[cat]))
  }

  function commitEdit(cat) {
    const v = parseFloat(editVal)
    if (!isNaN(v) && v >= 0) onUpdateBudget(cat, v)
    setEditing(null)
  }

  function handleAdd() {
    const name = newName.trim()
    if (!name) { setAddError('Enter a category name'); return }
    if (budgets[name] !== undefined) { setAddError('Category already exists'); return }
    const amt = parseFloat(newAmt)
    if (isNaN(amt) || amt < 0) { setAddError('Enter a valid budget amount'); return }
    onAddCategory(name, amt)
    setNewName('')
    setNewAmt('')
    setAddError('')
  }

  return (
    <div className="settings-page">
      {/* Monthly budgets */}
      <div className="card">
        <div className="card-title">Monthly Budgets</div>
        <div className="settings-total-row">
          <span>Total budget</span>
          <strong>{fmt(totalBudget)}</strong>
        </div>
        {Object.entries(budgets).map(([cat, amt]) => (
          <div key={cat} className="settings-row">
            <span className="settings-cat-name">{cat}</span>
            <div className="settings-controls">
              {editing === cat ? (
                <>
                  <span className="settings-pound">£</span>
                  <input
                    type="number"
                    className="settings-input"
                    value={editVal}
                    min="0"
                    step="1"
                    autoFocus
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(cat)
                      if (e.key === 'Escape') setEditing(null)
                    }}
                    onBlur={() => commitEdit(cat)}
                  />
                </>
              ) : (
                <>
                  <span className="settings-amt">{fmt(amt)}</span>
                  <button
                    className="icon-btn"
                    aria-label={`Edit ${cat}`}
                    onClick={() => startEdit(cat)}
                  >✏️</button>
                  <button
                    className="icon-btn"
                    aria-label={`Delete ${cat}`}
                    onClick={() => {
                      if (window.confirm(`Delete "${cat}"? Existing expenses won't be affected.`)) {
                        onDeleteCategory(cat)
                      }
                    }}
                  >🗑️</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add category */}
      <div className="card">
        <div className="card-title">Add Category</div>
        <div className="add-cat-row">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            className="add-cat-name"
            onChange={e => { setNewName(e.target.value); setAddError('') }}
          />
          <div className="add-cat-amt-wrap">
            <span className="add-cat-pound">£</span>
            <input
              type="number"
              placeholder="Budget"
              value={newAmt}
              className="add-cat-amt"
              min="0"
              onChange={e => { setNewAmt(e.target.value); setAddError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>Add</button>
        </div>
        {addError && <p className="field-error">{addError}</p>}
      </div>

      {/* Data section */}
      <div className="card">
        <div className="card-title">Data</div>
        <p className="settings-info">
          Your data is stored in this browser's <code>localStorage</code>.
          It persists across reloads and restarts as long as you use the same browser profile.
        </p>
        <button
          className="btn btn-secondary btn-full"
          onClick={() => downloadCSV(expenses)}
        >
          Export all expenses to CSV ↓
        </button>
      </div>

      {/* Reset */}
      <div className="card">
        <div className="card-title">Reset budgets to defaults</div>
        <p className="settings-info">Restores the original category names and amounts. Your logged expenses are not affected.</p>
        <button
          className="btn btn-secondary btn-full"
          onClick={() => {
            if (window.confirm('Reset all budgets to the defaults?')) {
              Object.entries(DEFAULT_BUDGETS).forEach(([cat, amt]) => onUpdateBudget(cat, amt))
            }
          }}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  )
}
