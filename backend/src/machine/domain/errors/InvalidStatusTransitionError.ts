export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string, reason?: string) {
    super(reason || `Cannot transition machine from '${from}' to '${to}'`);
    this.name = 'InvalidStatusTransitionError';
  }
}
