import React from 'react';
import { Thermometer, Gauge, Clock, Cpu, ExternalLink } from 'lucide-react';
import { MachineApiModel } from '../../../api/machineApi';
import { StatusBadge } from '../../../components/StatusBadge';

interface MachineCardProps {
  machine: MachineApiModel;
  onSelect?: (id: string) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine, onSelect }) => {
  const isHighTemp = machine.temperature >= 75;
  const isElevatedTemp = machine.temperature >= 65 && machine.temperature < 75;
  const isHighVibration = machine.vibration >= 3.0;

  const tempColor = isHighTemp
    ? 'text-rose-600 dark:text-rose-400'
    : isElevatedTemp
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400';

  const vibColor = isHighVibration
    ? 'text-rose-600 dark:text-rose-400 font-bold'
    : 'text-slate-700 dark:text-slate-200';

  return (
    <div
      onClick={() => onSelect && onSelect(machine.id)}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400">
                {machine.id}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {machine.name}
              </h3>
            </div>
          </div>
          <StatusBadge status={machine.status} size="sm" />
        </div>

        {/* Telemetry Section */}
        <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <Thermometer className={`h-4 w-4 shrink-0 ${tempColor}`} />
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Temperature</p>
              <p className={`text-sm font-extrabold ${tempColor}`}>{machine.temperature} °C</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <Gauge className="h-4 w-4 shrink-0 text-blue-500" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Vibration</p>
              <p className={`text-sm font-extrabold ${vibColor}`}>{machine.vibration} mm/s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Updated {new Date(machine.lastUpdated).toLocaleTimeString()}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-500 group-hover:underline">
          Details <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
};
