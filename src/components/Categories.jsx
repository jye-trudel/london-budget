import { useState } from 'react'
import { fmt } from '../utils'

export default function Categories({ budgets, onUpdateBudget, onAddCategory, onDeleteCategory }) {
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [newName, setNewName] = useState('')
  const [newAmt, setNewAmt] = useState('')
  const [error, setError] = useState('')

  const total = Object.values(budgets).reduce((a, b) => a + b, 0)

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
    if (!name) { setError('Enter a category name'); return }
    if (budgets[name] !== undefined) { setError('Category already exists'); return }
    const amt = parseFloat(newAmt)
    if (isNaN(amt) || amt < 0) { setError('Enter a valid budget amount'); return }
    onAddCategory(name, amt)
    setNewName('')
    setNewAmt('')
    setError('')
  }

  return (
    <div className="categories-page">
      <div className="card">
        <div className="card-title">Categories</div>
        <div className="cat-total-row">
          <span>Total monthly budget</span>
          <strong>{fmt(total)}</strong>
        </div>

        {Object.entries(budgets).map(([cat, amt]) => (
          <div key={cat} className="cat-row">
            <span className="cat-row-name">{cat}</span>
            <div className="cat-row-controls">
              {editing === cat ? (
                <>
                  <span className="cat-pound">£</span>
                  <input
                    type="number"
                    className="cat-edit-input"
                    value={editVal}
                    min="0"
                    autoFocus
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(cat)
                      if (e.key === 'Escape') setEditing(null)
                    }}
                    onBlur={() => commitEdit(cat)}
                  />
                  <button className="cat-btn" onClick={() => commitEdit(cat)}>Save</button>
                  <button className="cat-btn muted" onClick={() => setEditing(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className="cat-row-amt">{fmt(amt)}</span>
                  <button className="cat-btn" onClick={() => startEdit(cat)}>Edit</button>
                  <button className="cat-btn danger" onClick={() => {
                    if (window.confirm(`Delete "${cat}"? Existing expenses won't be affected.`))
                      onDeleteCategory(cat)
                  }}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Add Category</div>
        <div className="cat-add-row">
          <input
            type="text"
            placeholder="Category name"
            value={newName}
            className="cat-add-name"
            onChange={e => { setNewName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="cat-add-amt-wrap">
            <span className="cat-pound">£</span>
            <input
              type="number"
              placeholder="Budget"
              value={newAmt}
              className="cat-add-amt"
              min="0"
              onChange={e => { setNewAmt(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>Add</button>
        </div>
        {error && <p className="field-error">{error}</p>}
      </div>
    </div>
  )
}
