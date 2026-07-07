import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { fmt, barColor, daysInMonth } from '../utils'

function shortName(cat) {
  return cat.length > 11 ? cat.slice(0, 11) + '…' : cat
}

export default function SpendingChart({ budgets, catSpend, monthExpenses, month }) {
  const hasData = monthExpenses.length > 0
  if (!hasData) return null

  // --- Bar chart: spent vs budget per category ---
  const barData = Object.entries(budgets).map(([cat, budget]) => ({
    name: shortName(cat),
    fullName: cat,
    budget,
    spent: catSpend[cat] || 0,
  }))

  // --- Cumulative area chart ---
  const totalDays = daysInMonth(month)
  const dailyMap = {}
  monthExpenses.forEach(e => {
    const day = parseInt(e.date.split('-')[2], 10)
    dailyMap[day] = (dailyMap[day] || 0) + e.amount
  })
  let cumulative = 0
  const areaData = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1
    cumulative += dailyMap[day] || 0
    return { day, amount: parseFloat(cumulative.toFixed(2)) }
  })

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0)

  const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
  }

  return (
    <>
      <div className="card chart-card">
        <div className="card-title">Spent vs Budget</div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 44, left: 0 }} barGap={2}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              angle={-38}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={v => `£${v}`}
              width={44}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [fmt(value), name === 'spent' ? 'Spent' : 'Budget']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="budget" name="budget" fill="#e0e7ff" radius={[3, 3, 0, 0]} />
            <Bar dataKey="spent" name="spent" radius={[3, 3, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.spent / (entry.budget || 1))} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card chart-card">
        <div className="card-title">Cumulative Spend</div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={areaData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={v => `£${v}`}
              width={44}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={v => [fmt(v), 'Spent']}
              labelFormatter={d => `Day ${d}`}
            />
            {/* Budget reference line drawn as a simple dashed line via svg */}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#4f46e5"
              fill="#e0e7ff"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
