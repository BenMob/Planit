import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CHART_COLORS, formatCurrency } from '../utils/formatters'
import type { CategorySummary } from '../utils/categories'

interface ChartProps {
  data: CategorySummary[]
}

const tooltipStyle = {
  contentStyle: {
    background: '#1a2332',
    border: '1px solid #2d3a4f',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#f3f4f6'
  },
  itemStyle: { color: '#f3f4f6' },
  labelStyle: { color: '#f3f4f6' }
}

export default function Chart({ data }: ChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-500">
        Add expenses to see the chart
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.total
  }))

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
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
