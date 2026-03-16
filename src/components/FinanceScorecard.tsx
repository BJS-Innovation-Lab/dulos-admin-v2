'use client';

import React from 'react';

interface ScoreCardData {
  revenue: number;
  revenuePrevious: number;
  aov: number;
  aovPrevious: number;
  completedOrders: number;
  completedOrdersPrevious: number;
  occupancyPercent: number;
  occupancyPercentPrevious: number;
}

interface FinanceScorecardProps {
  data: ScoreCardData;
  currency?: string;
}

function formatCurrency(value: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value);
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

interface CardProps {
  title: string;
  value: string;
  change: number;
  isPercentage?: boolean;
}

function Card({ title, value, change, isPercentage = false }: CardProps) {
  const isPositive = change >= 0;
  const changeText = `${isPositive ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%`;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {value}
        {isPercentage && <span className="text-2xl">%</span>}
      </p>
      <p
        className={`text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {changeText} vs periodo anterior
      </p>
    </div>
  );
}

export default function FinanceScorecard({
  data,
  currency = 'MXN',
}: FinanceScorecardProps) {
  const revenueChange = calculateChange(data.revenue, data.revenuePrevious);
  const aovChange = calculateChange(data.aov, data.aovPrevious);
  const ordersChange = calculateChange(
    data.completedOrders,
    data.completedOrdersPrevious
  );
  const occupancyChange = calculateChange(
    data.occupancyPercent,
    data.occupancyPercentPrevious
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Revenue Total"
        value={formatCurrency(data.revenue, currency)}
        change={revenueChange}
      />
      <Card
        title="AOV (Ticket Promedio)"
        value={formatCurrency(data.aov, currency)}
        change={aovChange}
      />
      <Card
        title="Órdenes Completadas"
        value={formatNumber(data.completedOrders)}
        change={ordersChange}
      />
      <Card
        title="Ocupación"
        value={data.occupancyPercent.toFixed(1)}
        change={occupancyChange}
        isPercentage
      />
    </div>
  );
}
