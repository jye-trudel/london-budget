import { fmt, barColor } from '../utils'

export default function CategoryBar({ category, spent, budget }) {
  const pct = budget > 0 ? spent / budget : 0
  const color = barColor(pct)
  const isOver = pct >= 1
  const isNear = pct >= 0.9 && pct < 1

  return (
    <div className={`cat-bar-row${isOver ? ' is-over' : isNear ? ' is-near' : ''}`}>
      <div className="cat-bar-header">
        <span className="cat-bar-name">
          {category}
          {isOver && <span className="badge badge-over">Over!</span>}
          {isNear && <span className="badge badge-near">Near</span>}
        </span>
        <span className="cat-bar-amounts">
          <span className="cat-spent">{fmt(spent)}</span>
          <span className="cat-sep"> / </span>
          <span className="cat-budget">{fmt(budget)}</span>
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(100, pct * 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}
