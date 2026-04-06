import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Server, Monitor, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CONFIG = {
  planejada: { label: 'Planejada', color: '#155BCB', icon: Calendar },
  aprovada: { label: 'Aprovada', color: '#168821', icon: CheckCircle },
  em_execucao: { label: 'Em Execução', color: '#FFCD07', icon: Clock, darkText: true },
  concluida: { label: 'Concluída', color: '#071D41', icon: CheckCircle },
  cancelada: { label: 'Cancelada', color: '#E52207', icon: XCircle },
};

const TIPO_CONFIG = {
  infraestrutura: { label: 'Infraestrutura', color: '#1B5E20', icon: Server },
  sistemas: { label: 'Sistemas', color: '#1351B4', icon: Monitor },
  sapiens: { label: 'SAPIENS', color: '#D4500E', icon: BookOpen },
};

const RESULTADO_CONFIG = {
  sucesso: { label: 'Executada com sucesso', color: '#168821' },
  sucesso_ressalvas: { label: 'Com ressalvas', color: '#FFCD07', darkText: true },
  sem_sucesso: { label: 'Sem sucesso (Rollback)', color: '#E52207' },
};

function ConcluidaCard({ changes }) {
  const [expanded, setExpanded] = useState(false);
  const concluidas = changes.filter(c => c.status === 'concluida');
  const count = concluidas.length;

  const resultCounts = {};
  Object.keys(RESULTADO_CONFIG).forEach(k => { resultCounts[k] = 0; });
  concluidas.forEach(c => {
    const r = c.resultado_conclusao || '';
    if (resultCounts[r] !== undefined) resultCounts[r]++;
  });

  const cfg = STATUS_CONFIG.concluida;
  const Icon = cfg.icon;

  return (
    <div
      data-testid="metric-card-concluida"
      className="bg-white border border-[#E6E6E6] rounded-md shadow-sm hover:shadow-md transition-all relative"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
        data-testid="concluida-toggle"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: cfg.color }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-[#555555] uppercase tracking-wide">{cfg.label}</span>
          </div>
          {count > 0 && (
            expanded ? <ChevronUp className="w-4 h-4 text-[#555555]" /> : <ChevronDown className="w-4 h-4 text-[#555555]" />
          )}
        </div>
        <p className="text-2xl font-bold text-[#333333]">{count}</p>
      </button>

      {expanded && count > 0 && (
        <div className="border-t border-[#E6E6E6] px-4 py-3 space-y-1.5" data-testid="concluida-breakdown">
          {Object.entries(RESULTADO_CONFIG).map(([key, rcfg]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: rcfg.color }} />
                <span className="text-[#333333]">{rcfg.label}</span>
              </div>
              <span className="font-bold text-[#333333]">{resultCounts[key]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MetricsCards({ changes }) {
  const statusCounts = {};
  Object.keys(STATUS_CONFIG).forEach(k => { statusCounts[k] = 0; });
  changes.forEach(c => { if (statusCounts[c.status] !== undefined) statusCounts[c.status]++; });

  const tipoCounts = {};
  Object.keys(TIPO_CONFIG).forEach(k => { tipoCounts[k] = 0; });
  changes.forEach(c => {
    const tipo = c.tipo_mudanca || 'sistemas';
    if (tipoCounts[tipo] !== undefined) tipoCounts[tipo]++;
  });

  const statusesWithoutConcluida = Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'concluida');

  return (
    <div data-testid="metrics-cards" className="space-y-3">
      {/* Status metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {statusesWithoutConcluida.map(([key, cfg]) => {
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
        <ConcluidaCard changes={changes} />
      </div>

      {/* Type metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

export { STATUS_CONFIG, TIPO_CONFIG, RESULTADO_CONFIG };
