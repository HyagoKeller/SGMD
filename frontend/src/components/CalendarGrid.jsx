import React from 'react';
import { STATUS_CONFIG, FRENTE_CONFIG, NATUREZA_CONFIG, CATEGORIA_CONFIG } from './MetricsCards';
import { HardDrive, Monitor, Zap, AlertTriangle } from 'lucide-react';
import SuperSapiensIcon from './SuperSapiensIcon';

const FRENTE_ICONS = { infraestrutura: HardDrive, sistemas: Monitor, supersapiens: null };

function FrenteIcon({ frenteKey, className = "w-3 h-3", style = {} }) {
  if (frenteKey === 'supersapiens') return <SuperSapiensIcon className={className} style={style} />;
  const Icon = FRENTE_ICONS[frenteKey] || Monitor;
  return <Icon className={className} style={style} />;
}

function getFrente(change) {
  return change.frente_atuacao || change.tipo_mudanca || 'sistemas';
}

function getFrenteKey(change) {
  const f = getFrente(change);
  return f === 'sapiens' ? 'supersapiens' : f;
}

const RISCO_LABEL = { alto: 'Alto', medio: 'Medio', baixo: 'Baixo' };

export default function CalendarGrid({ currentDate, changes, onSelectChange, viewMode }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const isToday = (y, m, d) => today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const getChangesForDate = (dateStr) => {
    return changes.filter(c => {
      const start = (c.data_inicio || '').substring(0, 10);
      const end = (c.data_fim || c.data_inicio || '').substring(0, 10);
      return start <= dateStr && end >= dateStr;
    });
  };

  const formatDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  /* ========== EVENT BADGE - COMPACTO (semestral/anual) ========== */
  const renderCompactBadge = (change) => {
    const statusCfg = STATUS_CONFIG[change.status] || STATUS_CONFIG.planejada;
    const frenteKey = getFrenteKey(change);
    const isHighRisk = change.risco === 'alto';

    return (
      <button
        key={change.id}
        data-testid={`calendar-event-${change.id}`}
        onClick={(e) => { e.stopPropagation(); onSelectChange(change); }}
        className="text-[10px] font-semibold px-1.5 py-0.5 rounded w-full text-left flex items-center gap-1"
        style={{ backgroundColor: statusCfg.color, color: statusCfg.darkText ? '#333333' : '#ffffff' }}
      >
        <FrenteIcon frenteKey={frenteKey} className="w-2.5 h-2.5 flex-shrink-0" />
        <span className="truncate flex-1">{change.titulo}</span>
        {isHighRisk && (
          <span className="flex items-center gap-0.5 flex-shrink-0">
            <AlertTriangle className="w-3 h-3 text-[#E52207]" strokeWidth={2.5} />
          </span>
        )}
      </button>
    );
  };

  /* ========== EVENT BADGE - DETALHADO (mensal/semanal) ========== */
  const renderDetailedBadge = (change, isWeekly) => {
    const statusCfg = STATUS_CONFIG[change.status] || STATUS_CONFIG.planejada;
    const frenteKey = getFrenteKey(change);
    const frenteCfg = FRENTE_CONFIG[frenteKey] || FRENTE_CONFIG.sistemas;
    const naturezaCfg = NATUREZA_CONFIG[change.natureza_mudanca] || {};
    const categoriaCfg = CATEGORIA_CONFIG[change.categoria_mudanca] || {};
    const isHighRisk = change.risco === 'alto';
    const textColor = statusCfg.darkText ? '#333333' : '#ffffff';
    const subTextColor = statusCfg.darkText ? '#555555' : 'rgba(255,255,255,0.85)';

    return (
      <button
        key={change.id}
        data-testid={`calendar-event-${change.id}`}
        onClick={(e) => { e.stopPropagation(); onSelectChange(change); }}
        className="w-full text-left rounded-md shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-[3px] group"
        style={{ borderLeftColor: frenteCfg.color }}
      >
        <div className="px-2 py-1.5 rounded-r" style={{ backgroundColor: statusCfg.color }}>
          {/* Linha 1: Icone Frente + Titulo + Risco Alto */}
          <div className="flex items-start gap-1">
            <FrenteIcon frenteKey={frenteKey} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: textColor }} />
            <span className={`font-bold leading-tight flex-1 ${isWeekly ? 'text-xs' : 'text-[11px]'}`} style={{ color: textColor }}>
              {change.titulo}
            </span>
            {isHighRisk && (
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#E52207] ml-0.5" data-testid={`risk-icon-${change.id}`}>
                <AlertTriangle className="w-3 h-3 text-white" strokeWidth={2.5} />
              </span>
            )}
          </div>

          {/* Linha 2: Tags - Natureza + Categoria + Risco */}
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {naturezaCfg.label && (
              <span
                className="text-[9px] leading-tight px-1 py-[1px] rounded-sm font-semibold"
                style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: textColor }}
              >
                {naturezaCfg.label}
              </span>
            )}
            {categoriaCfg.label && (
              <span
                className="text-[9px] leading-tight px-1 py-[1px] rounded-sm font-medium"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: subTextColor }}
              >
                {categoriaCfg.label}
              </span>
            )}
            {isHighRisk && (
              <span className="text-[8px] leading-tight px-1 py-[1px] rounded-sm font-bold bg-[#E52207] text-white">
                RISCO ALTO
              </span>
            )}
          </div>

          {/* Linha 3 (semanal): Status + Responsavel */}
          {isWeekly && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[9px] leading-tight font-medium" style={{ color: subTextColor }}>
                {statusCfg.label}
              </span>
              {change.responsavel_negocio && (
                <>
                  <span className="text-[9px]" style={{ color: subTextColor }}>|</span>
                  <span className="text-[9px] leading-tight" style={{ color: subTextColor }}>
                    {change.responsavel_negocio}
                  </span>
                </>
              )}
              {change.sistemas_afetados && (
                <>
                  <span className="text-[9px]" style={{ color: subTextColor }}>|</span>
                  <span className="text-[9px] leading-tight" style={{ color: subTextColor }}>
                    {change.sistemas_afetados}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </button>
    );
  };

  // ====== SEMANAL ======
  if (viewMode === 'semanal') {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return (
      <div className="bg-white border border-[#E6E6E6] rounded-md overflow-hidden shadow-sm" data-testid="calendar-grid-semanal">
        <div className="grid grid-cols-7">
          {weekDays.map(wd => (
            <div key={wd} className="bg-[#f8f8f8] font-bold text-[#333333] p-2 md:p-3 text-center text-xs md:text-sm border-b border-r border-[#E6E6E6]">{wd}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
            const dayChanges = getChangesForDate(dateStr);
            const isTd = isToday(d.getFullYear(), d.getMonth(), d.getDate());
            return (
              <div key={i} className={`border-b border-r border-[#E6E6E6] p-2 min-h-[200px] ${isTd ? 'bg-[#D4E5FF]' : 'hover:bg-gray-50'}`}>
                <div className={`text-sm font-semibold mb-2 ${isTd ? 'text-[#1351B4] font-bold' : 'text-[#333333]'}`}>
                  {d.getDate()}/{d.getMonth() + 1}
                </div>
                <div className="space-y-1.5">
                  {dayChanges.map(c => renderDetailedBadge(c, true))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ====== SEMESTRAL ======
  if (viewMode === 'semestral') {
    const startMonth = month < 6 ? 0 : 6;
    const months = [];
    for (let m = startMonth; m < startMonth + 6; m++) months.push(m);
    const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return (
      <div className="bg-white border border-[#E6E6E6] rounded-md overflow-hidden shadow-sm" data-testid="calendar-grid-semestral">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
          {months.map(m => {
            const daysInM = new Date(year, m + 1, 0).getDate();
            const monthChanges = changes.filter(c => {
              const d = new Date((c.data_inicio || '').substring(0, 10) + 'T00:00:00');
              return d.getFullYear() === year && d.getMonth() === m;
            });
            return (
              <div key={m} className="border-b border-r border-[#E6E6E6] p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#1351B4]">{MONTH_NAMES_SHORT[m]} {year}</h3>
                  <span className="text-xs font-semibold text-[#555555] bg-[#f8f8f8] px-2 py-0.5 rounded">{monthChanges.length}</span>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-2">
                  {['D','S','T','Q','Q','S','S'].map((d,i) => <div key={i} className="text-center text-[10px] font-bold text-[#555555]">{d}</div>)}
                  {Array.from({ length: new Date(year, m, 1).getDay() }).map((_,i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInM }).map((_,i) => {
                    const day = i + 1;
                    const dateStr = formatDateStr(year, m, day);
                    const hasEvents = getChangesForDate(dateStr).length > 0;
                    const isTd = isToday(year, m, day);
                    return <div key={day} className={`text-center text-[10px] rounded-sm ${isTd ? 'bg-[#1351B4] text-white font-bold' : hasEvents ? 'bg-[#D4E5FF] text-[#1351B4] font-semibold' : 'text-[#555555]'}`}>{day}</div>;
                  })}
                </div>
                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                  {monthChanges.slice(0, 5).map(c => renderCompactBadge(c))}
                  {monthChanges.length > 5 && <span className="text-[10px] text-[#555555]">+{monthChanges.length - 5} mais</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ====== ANUAL ======
  if (viewMode === 'anual') {
    const MONTH_NAMES_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return (
      <div className="bg-white border border-[#E6E6E6] rounded-md overflow-hidden shadow-sm" data-testid="calendar-grid-anual">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0">
          {Array.from({ length: 12 }).map((_,m) => {
            const daysInM = new Date(year, m + 1, 0).getDate();
            const monthChanges = changes.filter(c => {
              const d = new Date((c.data_inicio || '').substring(0, 10) + 'T00:00:00');
              return d.getFullYear() === year && d.getMonth() === m;
            });
            return (
              <div key={m} className="border-b border-r border-[#E6E6E6] p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#1351B4]">{MONTH_NAMES_SHORT[m]}</h3>
                  <span className="text-xs font-semibold text-[#555555] bg-[#f8f8f8] px-2 py-0.5 rounded">{monthChanges.length}</span>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {['D','S','T','Q','Q','S','S'].map((d,i) => <div key={i} className="text-center text-[9px] font-bold text-[#555555]">{d}</div>)}
                  {Array.from({ length: new Date(year, m, 1).getDay() }).map((_,i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInM }).map((_,i) => {
                    const day = i + 1;
                    const dateStr = formatDateStr(year, m, day);
                    const hasEvents = getChangesForDate(dateStr).length > 0;
                    const isTd = isToday(year, m, day);
                    return <div key={day} className={`text-center text-[9px] rounded-sm ${isTd ? 'bg-[#1351B4] text-white font-bold' : hasEvents ? 'bg-[#D4E5FF] text-[#1351B4] font-semibold' : 'text-[#555555]'}`}>{day}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ====== MENSAL (padrao) ======
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const cells = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push({ day: null, key: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: `day-${d}` });
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) for (let i = 0; i < remaining; i++) cells.push({ day: null, key: `trailing-${i}` });

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-md overflow-hidden shadow-sm" data-testid="calendar-grid">
      <div className="grid grid-cols-7">
        {weekDays.map(wd => (
          <div key={wd} className="bg-[#f8f8f8] font-bold text-[#333333] p-2 md:p-3 text-center text-xs md:text-sm border-b border-r border-[#E6E6E6]">{wd}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map(cell => {
          const dateStr = cell.day ? formatDateStr(year, month, cell.day) : '';
          const dayChanges = cell.day ? getChangesForDate(dateStr) : [];
          const isTd = cell.day && isToday(year, month, cell.day);
          return (
            <div
              key={cell.key}
              className={`border-b border-r border-[#E6E6E6] p-1.5 md:p-2 min-h-[110px] md:min-h-[140px] transition-colors ${cell.day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-[#f8f8f8]'} ${isTd ? 'bg-[#D4E5FF]' : ''}`}
              data-testid={cell.day ? `calendar-cell-${cell.day}` : undefined}
            >
              {cell.day && (
                <>
                  <div className={`text-xs md:text-sm font-semibold mb-1 ${isTd ? 'text-[#1351B4] font-bold' : 'text-[#333333]'}`}>{cell.day}</div>
                  <div className="space-y-1">
                    {dayChanges.slice(0, 3).map(c => renderDetailedBadge(c, false))}
                    {dayChanges.length > 3 && <span className="text-[10px] text-[#555555] font-medium">+{dayChanges.length - 3} mais</span>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
