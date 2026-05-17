import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { CHART_COLORS, formatCurrency } from '../utils/formatters'
import type { CategorySummary } from '../utils/categories'

interface ChartProps {
  data: CategorySummary[]
  variant?: 'pie' | 'bar'
}

export default function Chart({ data, variant = 'pie' }: ChartProps) {
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
        {variant === 'pie' ? (
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
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                background: '#1a2332',
                border: '1px solid #2d3a4f',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#f3f4f6'
              }}
              itemStyle={{ color: '#f3f4f6' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
          </PieChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                background: '#1a2332',
                border: '1px solid #2d3a4f',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
              itemStyle={{ color: '#f3f4f6' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
