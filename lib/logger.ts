export interface RequestLog {
  requestId: string;
  timestamp: string;
  method: string | null;
  ip: string;
  latencyMs: number;
  statusCode: number;
  cacheHit: boolean;
  error: string | null;
  code: string | null;
}

export function createRequestLog(ip: string): RequestLog {
  return {
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    method: null,
    ip,
    latencyMs: 0,
    statusCode: 200,
    cacheHit: false,
    error: null,
    code: null,
  };
}

export function emitLog(log: RequestLog): void {
  console.log(JSON.stringify(log));
}
