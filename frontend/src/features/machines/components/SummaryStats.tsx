import React from 'react';
import { Activity, CheckCircle2, PauseCircle, AlertOctagon, Flame } from 'lucide-react';
import { StatCard } from '../../../components/StatCard';

interface SummaryStatsProps {
  total: number;
  running: number;
  idle: number;
  fault: number;
  avgTemperature: number;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  total,
  running,
  idle,
  fault,
  avgTemperature,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <StatCard
        title="Total Machines"
        value={total}
        icon={<Activity className="h-5 w-5 text-blue-500" />}
        subtitle="Monitored"
      />
      <StatCard
        title="Running"
        value={running}
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        variant="success"
        subtitle={`${total > 0 ? Math.round((running / total) * 100) : 0}% Active`}
      />
      <StatCard
        title="Idle / Standby"
        value={idle}
        icon={<PauseCircle className="h-5 w-5 text-amber-500" />}
        variant="warning"
      />
      <StatCard
        title="Faults / Critical"
        value={fault}
        icon={<AlertOctagon className="h-5 w-5 text-rose-500" />}
        variant="danger"
        subtitle={fault > 0 ? 'Requires Attention' : 'All Systems Nominal'}
      />
      <StatCard
        title="Avg Temperature"
        value={`${avgTemperature}°C`}
        icon={<Flame className="h-5 w-5 text-orange-500" />}
        subtitle="Thermal Mean"
      />
    </div>
  );
};
