import React, { useMemo, useState } from 'react';
import { TIPO_CONFIG } from './MetricsCards';
import { CheckCircle, AlertTriangle, Server, Monitor, BookOpen, Eye, EyeOff } from 'lucide-react';

const TIPO_ICONS = { infraestrutura: Server, sistemas: Monitor, sapiens: BookOpen };

export default function ConflictAlert({ changes }) {
  const [hidden, setHidden] = useState(false);
  const conflicts = useMemo(() => {
    if (!changes || changes.length < 2) return [];

    const found = [];
    const dateMap = {};

    // Build a map of all dates each change covers
    changes.forEach(c => {
      if (!c.data_inicio) return;
      const start = new Date(c.data_inicio + 'T00:00:00');
      const endStr = c.data_fim || c.data_inicio;
      const end = new Date(endStr + 'T00:00:00');

      const current = new Date(start);
      while (current <= end) {
        const key = current.toISOString().split('T')[0];
        if (!dateMap[key]) dateMap[key] = [];
        dateMap[key].push(c);
        current.setDate(current.getDate() + 1);
      }
    });

    // Find dates with 2+ changes
    const seenPairs = new Set();
    Object.entries(dateMap).forEach(([date, changesOnDate]) => {
      if (changesOnDate.length >= 2) {
        // Group all overlapping changes on this date
        const ids = changesOnDate.map(c => c.id).sort().join('|');
        if (!seenPairs.has(ids + date)) {
          seenPairs.add(ids + date);
          found.push({
            date,
            changes: changesOnDate,
          });
        }
      }
    });

    // Deduplicate by grouping same set of changes across consecutive dates
    const grouped = [];
    const processedSets = new Set();

    found.forEach(f => {
      const setKey = f.changes.map(c => c.id).sort().join('|');
      if (!processedSets.has(setKey)) {
        processedSets.add(setKey);
        const allDates = found
          .filter(ff => ff.changes.map(c => c.id).sort().join('|') === setKey)
          .map(ff => ff.date)
          .sort();
        grouped.push({
          dates: allDates,
          changes: f.changes,
        });
      }
    });

    return grouped;
  }, [changes]);

  if (conflicts.length === 0) {
    return (
      <div className="bg-[#E8F5E9] border border-[#168821]/30 rounded-md px-4 py-3 flex items-center justify-between" data-testid="conflict-alert-none">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#168821] flex-shrink-0" />
          <p className="text-sm font-medium text-[#168821]">
            Nenhum conflito de agendamento identificado no período.
          </p>
        </div>
      </div>
    );
  }

  if (hidden) {
    return (
      <div className="bg-[#FFF3CD] border border-[#FFCD07] rounded-md px-4 py-2.5 flex items-center justify-between" data-testid="conflict-alert-hidden">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#8A6D00] flex-shrink-0" />
          <p className="text-sm font-semibold text-[#8A6D00]">
            {conflicts.length} conflito{conflicts.length !== 1 ? 's' : ''} oculto{conflicts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          data-testid="conflict-show-button"
          onClick={() => setHidden(false)}
          className="flex items-center gap-1 text-xs font-semibold text-[#8A6D00] hover:text-[#333333] transition-colors"
        >
          <Eye className="w-4 h-4" />
          Exibir
        </button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateRange = (dates) => {
    if (dates.length === 1) return formatDate(dates[0]);
    return `${formatDate(dates[0])} a ${formatDate(dates[dates.length - 1])}`;
  };

  return (
    <div className="bg-[#FFF3CD] border border-[#FFCD07] rounded-md px-4 py-3 space-y-3" data-testid="conflict-alert">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#8A6D00] flex-shrink-0" />
          <p className="text-sm font-bold text-[#8A6D00]">
            {conflicts.length} conflito{conflicts.length !== 1 ? 's' : ''} de agendamento identificado{conflicts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          data-testid="conflict-hide-button"
          onClick={() => setHidden(true)}
          className="flex items-center gap-1 text-xs font-semibold text-[#8A6D00] hover:text-[#333333] transition-colors"
        >
          <EyeOff className="w-4 h-4" />
          Ocultar
        </button>
      </div>

      <div className="space-y-2">
        {conflicts.map((conflict, idx) => {
          return (
            <div key={idx} className="bg-white/70 border border-[#FFCD07]/50 rounded-md p-3" data-testid={`conflict-item-${idx}`}>
              <div className="flex items-start gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#8A6D00] bg-[#FFCD07]/30 px-2 py-0.5 rounded">
                  {formatDateRange(conflict.dates)}
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                {conflict.changes.map(c => {
                  const tipoCfg = TIPO_CONFIG[c.tipo_mudanca] || TIPO_CONFIG.sistemas;
                  const TIcon = TIPO_ICONS[c.tipo_mudanca] || Monitor;
                  return (
                    <div key={c.id} className="flex items-center gap-2 text-xs text-[#333333]">
                      <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: tipoCfg.color }}>
                        <TIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-semibold">{tipoCfg.label}</span>
                      <span className="text-[#555555]">-</span>
                      <span className="font-medium truncate">{c.titulo}</span>
                      {c.janela_manutencao && (
                        <span className="text-[#555555] flex-shrink-0">({c.janela_manutencao})</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-[#8A6D00] mt-2 italic">
                Recomendação: revise as datas de intervenção para evitar sobreposição.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
