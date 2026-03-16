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

const METRIC_ICONS: Record<string, React.ReactNode> = {
  'Ingresos del Mes': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="#E63946" strokeWidth="1.5"/>
      <path d="M12 9.5c-1.38 0-2.5.672-2.5 1.5s1.12 1.5 2.5 1.5 2.5.672 2.5 1.5-1.12 1.5-2.5 1.5" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 8.5v1m0 5v1" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="6" cy="12" r="0.5" fill="#E63946"/>
      <circle cx="18" cy="12" r="0.5" fill="#E63946"/>
    </svg>
  ),
  'Boletos Vendidos': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2.5a1.5 1.5 0 010 3V17a2 2 0 01-2 2H6a2 2 0 01-2-2v-4.5a1.5 1.5 0 010-3V7z" stroke="#E63946" strokeWidth="1.5"/>
      <path d="M9 5v2m0 10v2m0-8v4" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0 0"/>
      <path d="M13 9l2 2-2 2" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Ocupación Promedio': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M3 20h18" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="5" y="13" width="3" height="7" rx="1" fill="#E63946" fillOpacity="0.15" stroke="#E63946" strokeWidth="1.2"/>
      <rect x="10.5" y="9" width="3" height="11" rx="1" fill="#E63946" fillOpacity="0.25" stroke="#E63946" strokeWidth="1.2"/>
      <rect x="16" y="4" width="3" height="16" rx="1" fill="#E63946" fillOpacity="0.4" stroke="#E63946" strokeWidth="1.2"/>
      <circle cx="17.5" cy="3" r="1" fill="#E63946"/>
    </svg>
  ),
  'Funciones Próximas': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#E63946" strokeWidth="1.5"/>
      <path d="M3 10h18" stroke="#E63946" strokeWidth="1.5"/>
      <path d="M8 3v4m8-4v4" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="7" y="13" width="2.5" height="2.5" rx="0.5" fill="#E63946" fillOpacity="0.3"/>
      <rect x="10.75" y="13" width="2.5" height="2.5" rx="0.5" fill="#E63946"/>
      <rect x="14.5" y="13" width="2.5" height="2.5" rx="0.5" fill="#E63946" fillOpacity="0.3"/>
      <rect x="7" y="16.5" width="2.5" height="2.5" rx="0.5" fill="#E63946" fillOpacity="0.15"/>
      <rect x="10.75" y="16.5" width="2.5" height="2.5" rx="0.5" fill="#E63946" fillOpacity="0.15"/>
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg className="w-5 h-5" fill="none" stroke="#E63946" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

function MetricCard({ metric }: { metric: MetricData }) {
  const icon = METRIC_ICONS[metric.label] || DEFAULT_ICON;

  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{metric.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5">{metric.value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#E63946]/[0.07] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63946]/[0.12] transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-xs mt-2">
        <span className={metric.trend.isPositive ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>
          {metric.trend.isPositive ? '+' : ''}{metric.trend.value}%
        </span>
        <span className="text-gray-400 ml-1">vs periodo anterior</span>
      </p>
    </div>
  );
}

export default function HeroMetrics({ revenue, tickets, occupancy, upcoming }: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard metric={revenue} />
      <MetricCard metric={tickets} />
      <MetricCard metric={occupancy} />
      <MetricCard metric={upcoming} />
    </div>
  );
}
