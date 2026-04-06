import React from 'react';
import { STATUS_CONFIG, FRENTE_CONFIG, CATEGORIA_CONFIG } from './MetricsCards';
import { Clock, ArrowRight, HardDrive, Monitor, Zap, AlertTriangle } from 'lucide-react';

const FRENTE_ICONS = { infraestrutura: HardDrive, sistemas: Monitor, supersapiens: Zap };

function getFrente(change) {
  const f = change.frente_atuacao || change.tipo_mudanca || 'sistemas';
  return f === 'sapiens' ? 'supersapiens' : f;
}

export default function ChangeList({ changes, onSelectChange }) {
  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-[#555555]" data-testid="change-list-empty">
        <Clock className="w-10 h-10 mx-auto mb-2 text-[#CCCCCC]" />
        <p className="text-sm">Nenhuma mudança neste período</p>
      </div>
    );
  }

  const sorted = [...changes].sort((a, b) => (a.data_inicio || '').localeCompare(b.data_inicio || ''));

  return (
    <div className="space-y-2" data-testid="change-list">
      {sorted.map(change => {
        const cfg = STATUS_CONFIG[change.status] || STATUS_CONFIG.planejada;
        const frenteKey = getFrente(change);
        const frenteCfg = FRENTE_CONFIG[frenteKey] || FRENTE_CONFIG.sistemas;
        const FIcon = FRENTE_ICONS[frenteKey] || Monitor;
        const categoria = CATEGORIA_CONFIG[change.categoria_mudanca];
        const isHighRisk = change.risco === 'alto';

        return (
          <button
            key={change.id}
            data-testid={`change-list-item-${change.id}`}
            onClick={() => onSelectChange(change)}
            className="w-full text-left bg-white border border-[#E6E6E6] rounded-md p-3 hover:shadow-md transition-shadow flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0" style={{ backgroundColor: frenteCfg.color }}>
              <FIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-[#333333] truncate">{change.titulo}</p>
                {isHighRisk && <AlertTriangle className="w-4 h-4 text-[#E52207] flex-shrink-0" />}
                {change.numero_rfc && <span className="text-xs text-[#555555] flex-shrink-0">({change.numero_rfc})</span>}
              </div>
              <p className="text-xs text-[#555555] flex items-center gap-1">
                {(change.data_inicio || '').replace('T', ' ')}
                {change.data_fim && change.data_fim !== change.data_inicio && (
                  <>
                    <ArrowRight className="w-3 h-3" />
                    {(change.data_fim || '').replace('T', ' ')}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: cfg.color, color: cfg.darkText ? '#333333' : '#ffffff' }}>
                  {cfg.label}
                </span>
                <span className="text-xs text-[#555555]">{frenteCfg.label}</span>
                {categoria && <span className="text-xs text-[#555555] border border-[#E6E6E6] px-1.5 py-0.5 rounded">{categoria.label}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
