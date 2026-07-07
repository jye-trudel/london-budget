import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { daysInMonth, fmt, formatMonth, prevMonth } from '../utils'

function buildCumulative(allExpenses, month) {
  const total = daysInMonth(month)
  const dailyMap = {}
  allExpenses
    .filter(e => e.date.startsWith(month))
    .forEach(e => {
      const day = parseInt(e.date.split('-')[2], 10)
      dailyMap[day] = (dailyMap[day] || 0) + e.amount
    })
  let cum = 0
  return Array.from({ length: total }, (_, i) => {
    cum += dailyMap[i + 1] || 0
    return { day: i + 1, amount: parseFloat(cum.toFixed(2)) }
  })
}

const TOOLTIP = {
  backgroundColor: '#0f0f0f',
  border: '1px solid #2a2a2a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '12px',
  fontFamily: "'Courier Prime', 'Courier New', monospace",
}

const TICK = { fontSize: 10, fill: '#555555', fontFamily: "'Courier Prime', monospace" }

export default function InsightsPanel({ allExpenses, month }) {
  const lastM = prevMonth(month)

  const currentData = buildCumulative(allExpenses, month)
  const lastData    = buildCumulative(allExpenses, lastM)
  const hasLast     = lastData.some(d => d.amount > 0)

  // Merge both months day-by-day for the comparison chart
  const maxDays = Math.max(currentData.length, lastData.length)
  const compData = Array.from({ length: maxDays }, (_, i) => ({
    day: i + 1,
    current: currentData[i]?.amount ?? null,
    last:    lastData[i]?.amount    ?? null,
  }))

  const hasCurrent = currentData.some(d => d.amount > 0)

  return (
    <div className="insights-panel">
      {/* ── Cumulative spend this month ── */}
      <div className="card insight-card">
        <div className="card-title">Spending this month</div>
        {hasCurrent ? (
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={currentData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a1a1a" />
              <XAxis dataKey="day" tick={TICK} />
              <YAxis tick={TICK} tickFormatter={v => `£${v}`} width={44} />
              <Tooltip
                contentStyle={TOOLTIP}
                formatter={v => [fmt(v), 'Cumulative']}
                labelFormatter={d => `Day ${d}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#60a5fa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="insight-empty">No expenses logged yet</div>
        )}
      </div>

      {/* ── Month-over-month comparison ── */}
      <div className="card insight-card">
        <div className="card-title">Month comparison</div>
        {hasCurrent || hasLast ? (
          <>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={compData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1a1a1a" />
                <XAxis dataKey="day" tick={TICK} />
                <YAxis tick={TICK} tickFormatter={v => `£${v}`} width={44} />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(v, name) => [
                    fmt(v),
                    name === 'current' ? formatMonth(month) : formatMonth(lastM),
                  ]}
                  labelFormatter={d => `Day ${d}`}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#60a5fa' }}
                  connectNulls
                />
                {hasLast && (
                  <Line
                    type="monotone"
                    dataKey="last"
                    stroke="#f87171"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={{ r: 4, fill: '#f87171' }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>

            <div className="insight-legend">
              <span className="legend-item">
                <span className="legend-line" style={{ background: '#60a5fa' }} />
                {formatMonth(month)}
              </span>
              {hasLast && (
                <span className="legend-item">
                  <span className="legend-line legend-dashed" style={{ borderTopColor: '#f87171' }} />
                  {formatMonth(lastM)}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="insight-empty">No data yet</div>
        )}
      </div>
    </div>
  )
}
