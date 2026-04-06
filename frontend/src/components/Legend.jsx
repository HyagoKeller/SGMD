import React from 'react';
import { STATUS_CONFIG, FRENTE_CONFIG } from './MetricsCards';
import { HardDrive, Monitor } from 'lucide-react';
import SuperSapiensIcon from './SuperSapiensIcon';

function FrenteIconLegend({ frenteKey, className }) {
  if (frenteKey === 'supersapiens') return <SuperSapiensIcon className={className} />;
  const icons = { infraestrutura: HardDrive, sistemas: Monitor };
  const Icon = icons[frenteKey] || Monitor;
  return <Icon className={className} />;
}

export default function Legend() {
  return (
    <div data-testid="status-legend" className="space-y-4">
      <div>
        <h3 className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">Status</h3>
        <div className="space-y-1.5">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2" data-testid={`legend-item-${key}`}>
              <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <span className="text-sm text-[#333333]">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">Frente de Atuação</h3>
        <div className="space-y-1.5">
          {Object.entries(FRENTE_CONFIG).map(([key, cfg]) => {
            return (
              <div key={key} className="flex items-center gap-2" data-testid={`legend-frente-${key}`}>
                <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cfg.color }}>
                  <FrenteIconLegend frenteKey={key} className="w-3 h-3 text-white" />
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
