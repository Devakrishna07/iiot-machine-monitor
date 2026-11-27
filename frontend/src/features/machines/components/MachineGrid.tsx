import React from 'react';
import { MachineApiModel } from '../../../api/machineApi';
import { MachineCard } from './MachineCard';
import { Cpu } from 'lucide-react';

interface MachineGridProps {
  machines: MachineApiModel[];
  onSelectMachine?: (id: string) => void;
}

export const MachineGrid: React.FC<MachineGridProps> = ({ machines, onSelectMachine }) => {
  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
        <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
          <Cpu className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No machines match your criteria</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Try clearing your search query or switching the status filter tab to view other industrial units.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {machines.map((machine) => (
        <MachineCard key={machine.id} machine={machine} onSelect={onSelectMachine} />
      ))}
    </div>
  );
};
