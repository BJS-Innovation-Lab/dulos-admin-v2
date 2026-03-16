'use client';

import React from 'react';

interface Alert {
  type: 'critical' | 'warning';
  message: string;
  event: string;
}

interface AlertsBannerProps {
  alerts: Alert[];
}

function AlertItem({ alert }: { alert: Alert }) {
  const isCritical = alert.type === 'critical';

  const containerClasses = isCritical
    ? 'bg-red-50 border border-red-200'
    : 'bg-yellow-50 border border-yellow-200';

  const textClasses = isCritical
    ? 'text-red-800'
    : 'text-yellow-800';

  const eventClasses = isCritical
    ? 'text-red-600'
    : 'text-yellow-600';

  return (
    <div className={`${containerClasses} rounded-xl p-4 flex items-start gap-3`}>
      <span className="text-xl flex-shrink-0" role="img" aria-label="warning">
        ⚠️
      </span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${textClasses}`}>
          {alert.message}
        </p>
        <p className={`text-sm mt-1 ${eventClasses}`}>
          Evento: {alert.event}
        </p>
      </div>
      <button
        className={`text-sm font-medium ${textClasses} hover:underline flex-shrink-0`}
        onClick={() => {}}
      >
        Ver detalles
      </button>
    </div>
  );
}

export default function AlertsBanner({ alerts }: AlertsBannerProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const sortedAlerts = [...criticalAlerts, ...warningAlerts];

  return (
    <div className="space-y-3">
      {sortedAlerts.map((alert, index) => (
        <AlertItem key={index} alert={alert} />
      ))}
    </div>
  );
}
