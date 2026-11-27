import React from 'react';
import {
  X,
  Thermometer,
  Gauge,
  Clock,
  MapPin,
  Clock3,
  Cpu,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';
import { MachineDetailModel } from '../../../api/machineApi';
import { StatusBadge } from '../../../components/StatusBadge';

interface MachineDetailModalProps {
  machine: MachineDetailModel | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  machine,
  loading,
  error,
  onClose,
}) => {
  if (!machine && !loading && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {machine?.id || 'LOADING...'}
                </span>
                {machine && <StatusBadge status={machine.status} size="sm" />}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {machine?.name || 'Loading Machine Diagnostics...'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
              Fetching real-time sensor diagnostic packet...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs">
              {error}
            </div>
          )}

          {machine && (
            <>
              {/* Fault Diagnostic Alert Banner (if in fault) */}
              {machine.status === 'fault' && machine.fault && (
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 animate-bounce" />
                    <span className="font-bold text-sm tracking-wide">
                      CRITICAL FAULT DETECTED: {machine.fault.code}
                    </span>
                  </div>
                  <p className="text-xs text-rose-400 leading-relaxed pl-7">
                    {machine.fault.reason}
                  </p>
                  <div className="flex items-center justify-between pt-2 pl-7 text-[11px] text-rose-400/80 border-t border-rose-500/20">
                    <span>Triggered: {new Date(machine.fault.triggeredAt).toLocaleString()}</span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      ACTION REQUIRED
                    </span>
                  </div>
                </div>
              )}

              {/* Equipment Physical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Location</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {machine.location}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Equipment Type</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {machine.type}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Runtime Hours</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {machine.operatingHours.toLocaleString()} hrs
                  </p>
                </div>
              </div>

              {/* Live Telemetry Gauges */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Live Sensor Readings
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Operating Temp</p>
                      <p
                        className={`text-2xl font-black mt-1 ${
                          machine.temperature >= 75
                            ? 'text-rose-500'
                            : machine.temperature >= 65
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {machine.temperature} °C
                      </p>
                    </div>
                    <Thermometer className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Vibration Velocity</p>
                      <p
                        className={`text-2xl font-black mt-1 ${
                          machine.vibration >= 3.0 ? 'text-rose-500' : 'text-blue-500'
                        }`}
                      >
                        {machine.vibration} mm/s
                      </p>
                    </div>
                    <Gauge className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
              </div>

              {/* Telemetry History Stream */}
              {machine.telemetryHistory && machine.telemetryHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recent Telemetry History
                    </h4>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">Temperature</th>
                          <th className="py-2.5 px-3">Vibration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                        {machine.telemetryHistory.map((point, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                              {new Date(point.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-3 font-semibold">{point.temperature} °C</td>
                            <td className="py-2 px-3 font-semibold">{point.vibration} mm/s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Last Packet:{' '}
              {machine ? new Date(machine.lastUpdated).toLocaleTimeString() : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Close
            </button>
            {machine?.status === 'fault' && (
              <button
                disabled
                title="Enabled in next phase: Acknowledge Fault API"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 text-white opacity-80 cursor-not-allowed"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Acknowledge Fault (Pending Patch API)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
