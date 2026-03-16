'use client';

import React from 'react';

interface Schedule {
  name: string;
  date: string;
  capacity: number;
  sold: number;
  percentage: number;
}

interface CapacityBarsProps {
  schedules: Schedule[];
}

function getStatusConfig(percentage: number): {
  barColor: string;
  badgeColor: string;
  badgeText: string;
} {
  if (percentage > 80) {
    return {
      barColor: 'bg-[#E63946]',
      badgeColor: 'bg-red-100 text-red-800',
      badgeText: 'CRÍTICO',
    };
  }
  if (percentage >= 50) {
    return {
      barColor: 'bg-yellow-500',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      badgeText: 'ALTO',
    };
  }
  return {
    barColor: 'bg-green-500',
    badgeColor: 'bg-green-100 text-green-800',
    badgeText: 'NORMAL',
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

interface CapacityRowProps {
  schedule: Schedule;
}

function CapacityRow({ schedule }: CapacityRowProps) {
  const { barColor, badgeColor, badgeText } = getStatusConfig(schedule.percentage);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
      <div className="w-full sm:w-48 flex-shrink-0">
        <p className="font-medium text-gray-900 text-sm truncate">{schedule.name}</p>
        <p className="text-xs text-gray-500">{formatDate(schedule.date)}</p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(schedule.percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {schedule.sold.toLocaleString('es-MX')} / {schedule.capacity.toLocaleString('es-MX')} lugares
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-lg font-bold text-gray-900 w-14 text-right">
          {schedule.percentage.toFixed(0)}%
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor} w-20 text-center`}
        >
          {badgeText}
        </span>
      </div>
    </div>
  );
}

export default function CapacityBars({ schedules }: CapacityBarsProps) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
        No hay funciones programadas
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule, index) => (
        <CapacityRow key={`${schedule.name}-${schedule.date}-${index}`} schedule={schedule} />
      ))}
    </div>
  );
}
