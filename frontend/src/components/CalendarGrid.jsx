import React, { useMemo } from 'react';
import { STATUS_CONFIG, TIPO_CONFIG } from './MetricsCards';
import { Server, Monitor, BookOpen } from 'lucide-react';

const TIPO_ICONS = { infraestrutura: Server, sistemas: Monitor, sapiens: BookOpen };

export default function CalendarGrid({ currentDate, changes, onSelectChange, viewMode }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const isToday = (y, m, d) => today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const getChangesForDate = (dateStr) => {
    return changes.filter(c => {
      const start = c.data_inicio;
      const end = c.data_fim || c.data_inicio;
      return start <= dateStr && end >= dateStr;
    });
  };

  const formatDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const renderEventBadge = (change) => {
    const statusCfg = STATUS_CONFIG[change.status] || STATUS_CONFIG.planejada;
    const tipoCfg = TIPO_CONFIG[change.tipo_mudanca] || TIPO_CONFIG.sistemas;
    const TIcon = TIPO_ICONS[change.tipo_mudanca] || Monitor;
    return (
      <button
        key={change.id}
        data-testid={`calendar-event-${change.id}`}
        onClick={(e) => { e.stopPropagation(); onSelectChange(change); }}
        className="text-xs font-semibold px-1.5 py-0.5 rounded truncate w-full text-left flex items-center gap-1 shadow-sm hover:opacity-90 transition-opacity border-l-[3px]"
        style={{
          backgroundColor: tipoCfg.color,
          color: '#ffffff',
          borderLeftColor: statusCfg.color
        }}
        title={`${change.titulo} | ${tipoCfg.label} | ${statusCfg.label}`}
      >
        <TIcon className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{change.titulo}</span>
      </button>
    );
  };

  // ====== SEMANAL ======
  if (viewMode === 'semanal') {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

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
            <div key={wd} className="bg-[#f8f8f8] font-bold text-[#333333] p-3 text-center text-sm border-b border-r border-[#E6E6E6]">{wd}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
            const dayChanges = getChangesForDate(dateStr);
            const isTd = isToday(d.getFullYear(), d.getMonth(), d.getDate());
            return (
              <div key={i} className={`border-b border-r border-[#E6E6E6] p-2 min-h-[160px] ${isTd ? 'bg-[#D4E5FF]' : 'hover:bg-gray-50'}`}>
                <div className={`text-sm font-semibold mb-1 ${isTd ? 'text-[#1351B4] font-bold' : 'text-[#333333]'}`}>
                  {d.getDate()}/{d.getMonth() + 1}
                </div>
                <div className="space-y-1">
                  {dayChanges.map(c => renderEventBadge(c))}
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
    for (let m = startMonth; m < startMonth + 6; m++) {
      months.push(m);
    }
    const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return (
      <div className="bg-white border border-[#E6E6E6] rounded-md overflow-hidden shadow-sm" data-testid="calendar-grid-semestral">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
          {months.map(m => {
            const daysInM = new Date(year, m + 1, 0).getDate();
            const monthChanges = changes.filter(c => {
              const d = new Date(c.data_inicio + 'T00:00:00');
              return d.getFullYear() === year && d.getMonth() === m;
            });
            return (
              <div key={m} className="border-b border-r border-[#E6E6E6] p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#1351B4]">{MONTH_NAMES_SHORT[m]} {year}</h3>
                  <span className="text-xs font-semibold text-[#555555] bg-[#f8f8f8] px-2 py-0.5 rounded">{monthChanges.length}</span>
                </div>
                {/* Mini calendar grid */}
                <div className="grid grid-cols-7 gap-0.5 mb-2">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-[#555555]">{d}</div>
                  ))}
                  {Array.from({ length: new Date(year, m, 1).getDay() }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInM }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = formatDateStr(year, m, day);
                    const hasEvents = getChangesForDate(dateStr).length > 0;
                    const isTd = isToday(year, m, day);
                    return (
                      <div
                        key={day}
                        className={`text-center text-[10px] rounded-sm ${isTd ? 'bg-[#1351B4] text-white font-bold' : hasEvents ? 'bg-[#D4E5FF] text-[#1351B4] font-semibold' : 'text-[#555555]'}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                {/* Events list */}
                <div className="space-y-1 max-h-[100px] overflow-y-auto">
                  {monthChanges.slice(0, 4).map(c => {
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.planejada;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelectChange(c)}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate w-full text-left flex items-center gap-1"
                        style={{ backgroundColor: cfg.color, color: cfg.darkText ? '#333333' : '#ffffff' }}
                      >
                        <span className="truncate">{c.titulo}</span>
                      </button>
                    );
                  })}
                  {monthChanges.length > 4 && (
                    <span className="text-[10px] text-[#555555]">+{monthChanges.length - 4} mais</span>
                  )}
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
    const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return (
      <div className="bg-white border border-[#E6E6E6] rounded-md overflow-hidden shadow-sm" data-testid="calendar-grid-anual">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0">
          {Array.from({ length: 12 }).map((_, m) => {
            const daysInM = new Date(year, m + 1, 0).getDate();
            const monthChanges = changes.filter(c => {
              const d = new Date(c.data_inicio + 'T00:00:00');
              return d.getFullYear() === year && d.getMonth() === m;
            });
            return (
              <div key={m} className="border-b border-r border-[#E6E6E6] p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#1351B4]">{MONTH_NAMES_SHORT[m]}</h3>
                  <span className="text-xs font-semibold text-[#555555] bg-[#f8f8f8] px-2 py-0.5 rounded">{monthChanges.length}</span>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-bold text-[#555555]">{d}</div>
                  ))}
                  {Array.from({ length: new Date(year, m, 1).getDay() }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInM }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = formatDateStr(year, m, day);
                    const hasEvents = getChangesForDate(dateStr).length > 0;
                    const isTd = isToday(year, m, day);
                    return (
                      <div
                        key={day}
                        className={`text-center text-[9px] rounded-sm ${isTd ? 'bg-[#1351B4] text-white font-bold' : hasEvents ? 'bg-[#D4E5FF] text-[#1351B4] font-semibold' : 'text-[#555555]'}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ====== MENSAL (padrão) ======
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
              className={`border-b border-r border-[#E6E6E6] p-1.5 md:p-2 min-h-[80px] md:min-h-[110px] transition-colors ${
                cell.day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-[#f8f8f8]'
              } ${isTd ? 'bg-[#D4E5FF]' : ''}`}
              data-testid={cell.day ? `calendar-cell-${cell.day}` : undefined}
            >
              {cell.day && (
                <>
                  <div className={`text-xs md:text-sm font-semibold mb-1 ${isTd ? 'text-[#1351B4] font-bold' : 'text-[#333333]'}`}>
                    {cell.day}
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    {dayChanges.slice(0, 3).map(c => renderEventBadge(c))}
                    {dayChanges.length > 3 && (
                      <span className="text-[10px] md:text-xs text-[#555555] font-medium">+{dayChanges.length - 3} mais</span>
                    )}
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
