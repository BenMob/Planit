import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CHART_COLORS, formatCurrency } from '../utils/formatters'
import type { CategorySummary } from '../utils/categories'

interface ChartProps {
  data: CategorySummary[]
}

function getTooltipStyle() {
  return {
    contentStyle: {
      background: 'var(--chart-tooltip-bg)',
      border: '1px solid var(--chart-tooltip-border)',
      borderRadius: '8px',
      fontSize: '13px',
      color: 'var(--chart-tooltip-fg)'
    },
    itemStyle: { color: 'var(--chart-tooltip-fg)' },
    labelStyle: { color: 'var(--chart-tooltip-fg)' }
  }
}

export default function Chart({ data }: ChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-fg-subtle">
        Add expenses to see the chart
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.total
  }))

  const tooltipStyle = getTooltipStyle()

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} {...tooltipStyle} />
          <Legend wrapperStyle={{ color: 'var(--chart-legend)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
