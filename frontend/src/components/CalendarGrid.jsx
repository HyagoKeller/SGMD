import React from 'react';
import { STATUS_CONFIG, TIPO_CONFIG } from './MetricsCards';
import { Server, Monitor, BookOpen } from 'lucide-react';

const TIPO_ICONS = { infraestrutura: Server, sistemas: Monitor, sapiens: BookOpen };

export default function CalendarGrid({ currentDate, changes, onSelectChange }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date();

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ day: null, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `day-${d}` });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 0; i < remaining; i++) {
      cells.push({ day: null, key: `trailing-${i}` });
    }
  }

  const getChangesForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return changes.filter(c => {
      const start = c.data_inicio;
      const end = c.data_fim || c.data_inicio;
      return start <= dateStr && end >= dateStr;
    });
  };

  const isToday = (day) => {
    return day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-md overflow-hidden shadow-sm" data-testid="calendar-grid">
      {/* Week day headers */}
      <div className="grid grid-cols-7">
        {weekDays.map(wd => (
          <div key={wd} className="bg-[#f8f8f8] font-bold text-[#333333] p-3 text-center text-sm border-b border-r border-[#E6E6E6]">
            {wd}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map(cell => {
          const dayChanges = getChangesForDay(cell.day);
          return (
            <div
              key={cell.key}
              className={`border-b border-r border-[#E6E6E6] p-2 min-h-[110px] transition-colors ${
                cell.day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-[#f8f8f8]'
              } ${isToday(cell.day) ? 'bg-[#D4E5FF]' : ''}`}
              data-testid={cell.day ? `calendar-cell-${cell.day}` : undefined}
            >
              {cell.day && (
                <>
                  <div className={`text-sm font-semibold mb-1 ${isToday(cell.day) ? 'text-[#1351B4] font-bold' : 'text-[#333333]'}`}>
                    {cell.day}
                  </div>
                  <div className="space-y-1">
                    {dayChanges.slice(0, 3).map(change => {
                      const cfg = STATUS_CONFIG[change.status] || STATUS_CONFIG.planejada;
                      return (
                        <button
                          key={change.id}
                          data-testid={`calendar-event-${change.id}`}
                          onClick={() => onSelectChange(change)}
                          className="text-xs font-semibold px-2 py-1 rounded truncate w-full text-left flex items-center gap-1 shadow-sm hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: cfg.color,
                            color: cfg.darkText ? '#333333' : '#ffffff'
                          }}
                          title={`${change.titulo} (${(TIPO_CONFIG[change.tipo_mudanca] || TIPO_CONFIG.sistemas).label})`}
                        >
                          {(() => { const TIcon = TIPO_ICONS[change.tipo_mudanca] || Monitor; return <TIcon className="w-3 h-3 flex-shrink-0" />; })()}
                          <span className="truncate">{change.titulo}</span>
                        </button>
                      );
                    })}
                    {dayChanges.length > 3 && (
                      <span className="text-xs text-[#555555] font-medium">+{dayChanges.length - 3} mais</span>
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
