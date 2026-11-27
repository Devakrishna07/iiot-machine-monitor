import { InvalidStatusTransitionError } from '../errors/InvalidStatusTransitionError.js';

export type MachineStatus = 'running' | 'idle' | 'fault';

export interface FaultDetails {
  code: string;
  reason: string;
  triggeredAt: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  notes?: string | null;
}

export interface TelemetryPoint {
  timestamp: string;
  temperature: number;
  vibration: number;
}

export interface MachineProps {
  id: string;
  name: string;
  status: MachineStatus;
  temperature: number;
  vibration: number;
  lastUpdated: string;
  type?: string;
  location?: string;
  operatingHours?: number;
  fault?: FaultDetails | null;
  telemetryHistory?: TelemetryPoint[];
}

export class Machine {
  private constructor(private readonly props: MachineProps) {}

  public static create(props: MachineProps): Machine {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Machine ID cannot be empty');
    }
    if (!props.name || props.name.trim() === '') {
      throw new Error('Machine name cannot be empty');
    }
    const validStatuses: MachineStatus[] = ['running', 'idle', 'fault'];
    if (!validStatuses.includes(props.status)) {
      throw new Error(`Invalid machine status: ${props.status}`);
    }

    return new Machine({
      ...props,
      lastUpdated: props.lastUpdated || new Date().toISOString(),
      type: props.type || 'Industrial Machinery',
      location: props.location || 'Main Plant Floor',
      operatingHours: props.operatingHours || 0,
      fault: props.fault || null,
      telemetryHistory: props.telemetryHistory || [],
    });
  }

  public acknowledgeFault(supervisorId: string, notes?: string): void {
    if (this.props.status !== 'fault') {
      throw new InvalidStatusTransitionError(
        this.props.status,
        'idle',
        `Cannot acknowledge fault on machine '${this.props.name}' (${this.props.id}) because its current status is '${this.props.status}', not 'fault'.`
      );
    }

    if (!supervisorId || supervisorId.trim() === '') {
      throw new Error('supervisorId is required to acknowledge a machine fault');
    }

    const now = new Date().toISOString();

    // Transition state
    this.props.status = 'idle';
    this.props.lastUpdated = now;

    // Normalize standby telemetry safely
    if (this.props.temperature > 50) {
      this.props.temperature = Number((this.props.temperature * 0.75).toFixed(1));
    }
    if (this.props.vibration > 1.0) {
      this.props.vibration = 0.25;
    }

    // Update fault record
    if (this.props.fault) {
      this.props.fault = {
        ...this.props.fault,
        isAcknowledged: true,
        acknowledgedBy: supervisorId.trim(),
        acknowledgedAt: now,
        notes: notes?.trim() || null,
      };
    }

    // Append to telemetry history
    if (this.props.telemetryHistory) {
      this.props.telemetryHistory.push({
        timestamp: now,
        temperature: this.props.temperature,
        vibration: this.props.vibration,
      });
    }
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get status(): MachineStatus {
    return this.props.status;
  }

  public get temperature(): number {
    return this.props.temperature;
  }

  public get vibration(): number {
    return this.props.vibration;
  }

  public get lastUpdated(): string {
    return this.props.lastUpdated;
  }

  public get type(): string | undefined {
    return this.props.type;
  }

  public get location(): string | undefined {
    return this.props.location;
  }

  public get operatingHours(): number | undefined {
    return this.props.operatingHours;
  }

  public get fault(): FaultDetails | null | undefined {
    return this.props.fault;
  }

  public get telemetryHistory(): TelemetryPoint[] | undefined {
    return this.props.telemetryHistory;
  }

  public toJSON(): MachineProps {
    return { ...this.props };
  }
}
