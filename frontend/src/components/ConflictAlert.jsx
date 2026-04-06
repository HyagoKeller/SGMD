import React, { useMemo, useState } from 'react';
import { FRENTE_CONFIG } from './MetricsCards';
import { CheckCircle, AlertTriangle, HardDrive, Monitor, Eye, EyeOff } from 'lucide-react';
import SuperSapiensIcon from './SuperSapiensIcon';

function FrenteIconConflict({ frenteKey, className, style }) {
  if (frenteKey === 'supersapiens') return <SuperSapiensIcon className={className} style={style} />;
  const icons = { infraestrutura: HardDrive, sistemas: Monitor };
  const Icon = icons[frenteKey] || Monitor;
  return <Icon className={className} style={style} />;
}

function getFrente(change) {
  const f = change.frente_atuacao || change.tipo_mudanca || 'sistemas';
  return f === 'sapiens' ? 'supersapiens' : f;
}

export default function ConflictAlert({ changes }) {
  const [hidden, setHidden] = useState(false);

  const conflicts = useMemo(() => {
    if (!changes || changes.length < 2) return [];
    const dateMap = {};
    changes.forEach(c => {
      if (!c.data_inicio) return;
      const start = new Date((c.data_inicio || '').substring(0, 10) + 'T00:00:00');
      const endStr = (c.data_fim || c.data_inicio || '').substring(0, 10);
      const end = new Date(endStr + 'T00:00:00');
      const current = new Date(start);
      while (current <= end) {
        const key = current.toISOString().split('T')[0];
        if (!dateMap[key]) dateMap[key] = [];
        dateMap[key].push(c);
        current.setDate(current.getDate() + 1);
      }
    });
    const grouped = [];
    const processedSets = new Set();
    Object.entries(dateMap).forEach(([date, changesOnDate]) => {
      if (changesOnDate.length >= 2) {
        const setKey = changesOnDate.map(c => c.id).sort().join('|');
        if (!processedSets.has(setKey)) {
          processedSets.add(setKey);
          const allDates = Object.entries(dateMap)
            .filter(([, chs]) => chs.map(c => c.id).sort().join('|') === setKey)
            .map(([d]) => d).sort();
          grouped.push({ dates: allDates, changes: changesOnDate });
        }
      }
    });
    return grouped;
  }, [changes]);

  if (conflicts.length === 0) {
    return (
      <div className="bg-[#E8F5E9] border border-[#168821]/30 rounded-md px-4 py-3 flex items-center justify-between" data-testid="conflict-alert-none">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#168821] flex-shrink-0" />
          <p className="text-sm font-medium text-[#168821]">Nenhum conflito de agendamento identificado no período.</p>
        </div>
      </div>
    );
  }

  if (hidden) {
    return (
      <div className="bg-[#FFF3CD] border border-[#FFCD07] rounded-md px-4 py-2.5 flex items-center justify-between" data-testid="conflict-alert-hidden">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#8A6D00] flex-shrink-0" />
          <p className="text-sm font-semibold text-[#8A6D00]">{conflicts.length} conflito{conflicts.length !== 1 ? 's' : ''} oculto{conflicts.length !== 1 ? 's' : ''}</p>
        </div>
        <button data-testid="conflict-show-button" onClick={() => setHidden(false)} className="flex items-center gap-1 text-xs font-semibold text-[#8A6D00] hover:text-[#333333] transition-colors">
          <Eye className="w-4 h-4" /> Exibir
        </button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatDateRange = (dates) => dates.length === 1 ? formatDate(dates[0]) : `${formatDate(dates[0])} a ${formatDate(dates[dates.length - 1])}`;

  return (
    <div className="bg-[#FFF3CD] border border-[#FFCD07] rounded-md px-4 py-3 space-y-3" data-testid="conflict-alert">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#8A6D00] flex-shrink-0" />
          <p className="text-sm font-bold text-[#8A6D00]">{conflicts.length} conflito{conflicts.length !== 1 ? 's' : ''} de agendamento identificado{conflicts.length !== 1 ? 's' : ''}</p>
        </div>
        <button data-testid="conflict-hide-button" onClick={() => setHidden(true)} className="flex items-center gap-1 text-xs font-semibold text-[#8A6D00] hover:text-[#333333] transition-colors">
          <EyeOff className="w-4 h-4" /> Ocultar
        </button>
      </div>
      <div className="space-y-2">
        {conflicts.map((conflict, idx) => (
          <div key={idx} className="bg-white/70 border border-[#FFCD07]/50 rounded-md p-3" data-testid={`conflict-item-${idx}`}>
            <span className="text-xs font-bold text-[#8A6D00] bg-[#FFCD07]/30 px-2 py-0.5 rounded">{formatDateRange(conflict.dates)}</span>
            <div className="mt-2 space-y-1.5">
              {conflict.changes.map(c => {
                const frenteKey = getFrente(c);
                  const frenteCfg = FRENTE_CONFIG[frenteKey] || FRENTE_CONFIG.sistemas;
                const startTime = (c.data_inicio || '').includes('T') ? (c.data_inicio || '').split('T')[1]?.substring(0,5) : '';
                const endTime = (c.data_fim || '').includes('T') ? (c.data_fim || '').split('T')[1]?.substring(0,5) : '';
                return (
                  <div key={c.id} className="flex items-center gap-2 text-xs text-[#333333]">
                    <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: frenteCfg.color }}>
                      <FrenteIconConflict frenteKey={frenteKey} className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold">{frenteCfg.label}</span>
                    <span className="text-[#555555]">-</span>
                    <span className="font-medium truncate">{c.titulo}</span>
                    {(startTime || endTime) && (
                      <span className="text-[#555555] flex-shrink-0">({startTime}{endTime ? ` - ${endTime}` : ''})</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[#8A6D00] mt-2 italic">Recomendação: revise as datas de intervenção para evitar sobreposição.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
