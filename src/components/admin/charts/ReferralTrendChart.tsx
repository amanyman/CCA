import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PeriodCount } from '../../../utils/analytics';

interface ReferralTrendChartProps {
  data: PeriodCount[];
  timeRange?: string;
}

export function ReferralTrendChart({ data, timeRange }: ReferralTrendChartProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Referral Trends</h3>
        {timeRange && (
          <span className="text-xs text-slate-500">{timeRange}</span>
        )}
      </div>
      {data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#1E3A5F"
              strokeWidth={2}
              dot={{ r: 4, fill: '#1E3A5F' }}
              activeDot={{ r: 6 }}
              name="Referrals"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
