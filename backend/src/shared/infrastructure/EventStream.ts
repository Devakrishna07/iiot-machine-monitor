import { Response } from 'express';

export class EventStreamManager {
  private static instance: EventStreamManager;
  private clients: Set<Response> = new Set();

  private constructor() {
    // Send keep-alive heartbeat ping every 25 seconds
    setInterval(() => {
      this.broadcast('ping', { timestamp: new Date().toISOString() });
    }, 25000);
  }

  public static getInstance(): EventStreamManager {
    if (!EventStreamManager.instance) {
      EventStreamManager.instance = new EventStreamManager();
    }
    return EventStreamManager.instance;
  }

  public addClient(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Initial connection ack
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'SSE Stream Connected' })}\n\n`);

    this.clients.add(res);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  public get clientCount(): number {
    return this.clients.size;
  }
}

export const eventStream = EventStreamManager.getInstance();
