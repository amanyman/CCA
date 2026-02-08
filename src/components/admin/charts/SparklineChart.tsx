import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: { value: number }[];
  color?: string;
  height?: number;
}

export function SparklineChart({ data, color = '#3B82F6', height = 40 }: SparklineChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
