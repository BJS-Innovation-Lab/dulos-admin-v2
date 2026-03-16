'use client';

interface TrendData {
  value: number;
  isPositive: boolean;
}

interface MetricData {
  label: string;
  value: string;
  trend: TrendData;
  sparkline: number[];
}

interface HeroMetricsProps {
  revenue: MetricData;
  tickets: MetricData;
  occupancy: MetricData;
  upcoming: MetricData;
}

function SparklineBars({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-8 mt-2">
      {data.map((value, index) => (
        <div
          key={index}
          className="w-2 bg-[#E63946] rounded-sm"
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: MetricData }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <p className="text-sm text-gray-500">{metric.label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</p>
      <p className={`text-sm mt-1 ${metric.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {metric.trend.isPositive ? '▲' : '▼'} {Math.abs(metric.trend.value)}%
      </p>
      <SparklineBars data={metric.sparkline} />
    </div>
  );
}

export default function HeroMetrics({ revenue, tickets, occupancy, upcoming }: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard metric={revenue} />
      <MetricCard metric={tickets} />
      <MetricCard metric={occupancy} />
      <MetricCard metric={upcoming} />
    </div>
  );
}
