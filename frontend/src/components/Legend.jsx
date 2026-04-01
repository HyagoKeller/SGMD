import React from 'react';
import { STATUS_CONFIG, TIPO_CONFIG } from './MetricsCards';
import { Server, Monitor, BookOpen } from 'lucide-react';

const TIPO_ICONS = { infraestrutura: Server, sistemas: Monitor, sapiens: BookOpen };

export default function Legend() {
  return (
    <div data-testid="status-legend" className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#333333] mb-3 uppercase tracking-wide">Status</h3>
        <div className="space-y-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2" data-testid={`legend-item-${key}`}>
              <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <span className="text-sm text-[#333333]">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#333333] mb-3 uppercase tracking-wide">Tipo de Mudança</h3>
        <div className="space-y-2">
          {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
            const Icon = TIPO_ICONS[key] || Monitor;
            return (
              <div key={key} className="flex items-center gap-2" data-testid={`legend-tipo-${key}`}>
                <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cfg.color }}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-[#333333]">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
