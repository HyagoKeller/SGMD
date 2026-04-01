import React from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, XCircle, Zap, Server, Monitor, BookOpen } from 'lucide-react';

const STATUS_CONFIG = {
  planejada: { label: 'Planejada', color: '#155BCB', icon: Calendar },
  aprovada: { label: 'Aprovada', color: '#168821', icon: CheckCircle },
  em_execucao: { label: 'Em Execução', color: '#FFCD07', icon: Clock, darkText: true },
  concluida: { label: 'Concluída', color: '#071D41', icon: CheckCircle },
  cancelada: { label: 'Cancelada', color: '#E52207', icon: XCircle },
  emergencial: { label: 'Emergencial', color: '#8A100B', icon: AlertTriangle },
};

const TIPO_CONFIG = {
  infraestrutura: { label: 'Infraestrutura', color: '#0C326F', icon: Server },
  sistemas: { label: 'Sistemas', color: '#1351B4', icon: Monitor },
  sapiens: { label: 'SAPIENS', color: '#155BCB', icon: BookOpen },
};

export default function MetricsCards({ changes }) {
  // Status counts
  const statusCounts = {};
  Object.keys(STATUS_CONFIG).forEach(k => { statusCounts[k] = 0; });
  changes.forEach(c => { if (statusCounts[c.status] !== undefined) statusCounts[c.status]++; });

  // Type counts
  const tipoCounts = {};
  Object.keys(TIPO_CONFIG).forEach(k => { tipoCounts[k] = 0; });
  changes.forEach(c => { 
    const tipo = c.tipo_mudanca || 'sistemas';
    if (tipoCounts[tipo] !== undefined) tipoCounts[tipo]++;
  });

  return (
    <div data-testid="metrics-cards" className="space-y-4">
      {/* Status metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              data-testid={`metric-card-${key}`}
              className="bg-white border border-[#E6E6E6] rounded-md shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: cfg.color }}
                >
                  <Icon className="w-4 h-4" style={{ color: cfg.darkText ? '#333333' : '#ffffff' }} />
                </div>
                <span className="text-xs font-semibold text-[#555555] uppercase tracking-wide">{cfg.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#333333]">{statusCounts[key]}</p>
            </div>
          );
        })}
      </div>

      {/* Type metrics */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              data-testid={`metric-tipo-${key}`}
              className="bg-white border-l-4 border border-[#E6E6E6] rounded-md shadow-sm p-3 hover:shadow-md transition-shadow flex items-center gap-3"
              style={{ borderLeftColor: cfg.color }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: cfg.color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#555555] uppercase tracking-wide">{cfg.label}</p>
                <p className="text-xl font-bold text-[#333333]">{tipoCounts[key]}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { STATUS_CONFIG, TIPO_CONFIG };
