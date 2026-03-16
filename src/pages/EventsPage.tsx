'use client';

import { useState } from 'react';

interface Event {
  id: string;
  name: string;
  date: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
}

interface Project {
  id: string;
  name: string;
  producer: string;
  status: 'PUBLICADO' | 'BORRADOR' | 'ARCHIVADO';
  events: Event[];
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Así Lo Veo Yo',
    producer: 'Dulos Entertainment',
    status: 'PUBLICADO',
    events: [
      { id: '1a', name: 'Así Lo Veo Yo - Teatro Diana', date: '2024-03-15', ticketsSold: 450, totalTickets: 500, revenue: 225000 },
      { id: '1b', name: 'Así Lo Veo Yo - Auditorio Nacional', date: '2024-03-22', ticketsSold: 2800, totalTickets: 10000, revenue: 1400000 },
    ],
  },
  {
    id: '2',
    name: 'Infierno',
    producer: 'Dulos Entertainment',
    status: 'PUBLICADO',
    events: [
      { id: '2a', name: 'Infierno - Foro Sol', date: '2024-04-10', ticketsSold: 35000, totalTickets: 65000, revenue: 17500000 },
    ],
  },
  {
    id: '3',
    name: 'Oh Karen',
    producer: 'Dulos Entertainment',
    status: 'BORRADOR',
    events: [
      { id: '3a', name: 'Oh Karen - Teatro Metropólitan', date: '2024-05-01', ticketsSold: 0, totalTickets: 3000, revenue: 0 },
    ],
  },
  {
    id: '4',
    name: 'Lucero',
    producer: 'Dulos Entertainment',
    status: 'PUBLICADO',
    events: [
      { id: '4a', name: 'Lucero - Arena Monterrey', date: '2024-04-28', ticketsSold: 12000, totalTickets: 17000, revenue: 6000000 },
      { id: '4b', name: 'Lucero - Arena CDMX', date: '2024-05-05', ticketsSold: 8500, totalTickets: 22000, revenue: 4250000 },
    ],
  },
  {
    id: '5',
    name: 'Maleficio',
    producer: 'Dulos Entertainment',
    status: 'ARCHIVADO',
    events: [
      { id: '5a', name: 'Maleficio - Palacio de los Deportes', date: '2023-10-31', ticketsSold: 18000, totalTickets: 20000, revenue: 9000000 },
    ],
  },
];

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'PUBLICADO':
      return 'bg-green-500';
    case 'BORRADOR':
      return 'bg-[#f8f6f6]0';
    case 'ARCHIVADO':
      return 'bg-red-500';
  }
};

const getOccupancyColor = (percentage: number) => {
  if (percentage < 50) return 'bg-green-500';
  if (percentage <= 80) return 'bg-yellow-500';
  return 'bg-red-500';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function EventsPage() {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.producer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectTotals = (project: Project) => {
    const totalRevenue = project.events.reduce((sum, e) => sum + e.revenue, 0);
    const eventCount = project.events.length;
    return { totalRevenue, eventCount };
  };

  return (
    <div className="min-h-screen bg-[#f8f6f6] py-8">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">EVENTOS</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#E63946] focus:outline-none focus:ring-1 focus:ring-[#E63946]"
            />
            <button
              onClick={() => alert('Crear nuevo proyecto')}
              className="rounded-lg bg-[#E63946] px-4 py-2 font-medium text-white transition-colors hover:bg-[#c5303c]"
            >
              + Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const isExpanded = expandedIds.includes(project.id);
            const { totalRevenue, eventCount } = getProjectTotals(project);

            return (
              <div
                key={project.id}
                className="overflow-hidden rounded-lg bg-white shadow-md"
              >
                {/* Card Header (clickable) */}
                <div
                  onClick={() => toggleExpand(project.id)}
                  className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[#f8f6f6]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    >
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">{project.producer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium text-white ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(totalRevenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {eventCount} evento{eventCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-[#f8f6f6]">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                            <th className="px-4 py-3 font-medium">Evento</th>
                            <th className="px-4 py-3 font-medium">Fecha</th>
                            <th className="px-4 py-3 font-medium">Ocupación</th>
                            <th className="px-4 py-3 font-medium">Revenue</th>
                            <th className="px-4 py-3 font-medium">Boletos</th>
                            <th className="px-4 py-3 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.events.map((event) => {
                            const occupancy =
                              (event.ticketsSold / event.totalTickets) * 100;
                            return (
                              <tr
                                key={event.id}
                                className="border-b border-gray-200 last:border-b-0"
                              >
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {event.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {formatDate(event.date)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                      <div
                                        className={`h-full ${getOccupancyColor(occupancy)}`}
                                        style={{ width: `${occupancy}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {occupancy.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {formatCurrency(event.revenue)}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {event.ticketsSold.toLocaleString()} /{' '}
                                  {event.totalTickets.toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => alert('Editar evento: ' + event.name)}
                                      className="rounded-md bg-[#E63946] px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-[#c5303c]"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => alert('Editar evento: ' + event.name)}
                                      className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-[#f8f6f6]"
                                    >
                                      Ver
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-500">No se encontraron proyectos</p>
          </div>
        )}
      </div>
    </div>
  );
}
