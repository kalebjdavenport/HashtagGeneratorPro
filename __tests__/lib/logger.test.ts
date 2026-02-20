import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequestLog, emitLog } from "@/lib/logger";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("createRequestLog returns all default fields", () => {
    const log = createRequestLog("1.2.3.4");
    expect(log).toEqual(
      expect.objectContaining({
        requestId: expect.any(String),
        timestamp: expect.any(String),
        method: null,
        ip: "1.2.3.4",
        latencyMs: 0,
        statusCode: 200,
        cacheHit: false,
        error: null,
        code: null,
      }),
    );
  });

  it("requestId is a valid UUID", () => {
    const log = createRequestLog("1.2.3.4");
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(log.requestId).toMatch(uuidRegex);
  });

  it("timestamp is valid ISO 8601", () => {
    const log = createRequestLog("1.2.3.4");
    const parsed = new Date(log.timestamp);
    expect(parsed.toISOString()).toBe(log.timestamp);
  });

  it("ip is set from argument", () => {
    const log = createRequestLog("10.0.0.1");
    expect(log.ip).toBe("10.0.0.1");
  });

  it("emitLog outputs valid JSON to console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const log = createRequestLog("1.2.3.4");
    emitLog(log);

    expect(spy).toHaveBeenCalledOnce();
    const output = spy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.requestId).toBe(log.requestId);
    expect(parsed.ip).toBe("1.2.3.4");
  });

  it("log fields are mutable and reflected in output", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const log = createRequestLog("1.2.3.4");
    log.method = "claude";
    log.statusCode = 429;
    log.cacheHit = true;
    log.error = "rate limited";
    log.code = "RATE_LIMITED";
    log.latencyMs = 150;

    emitLog(log);

    const output = spy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.method).toBe("claude");
    expect(parsed.statusCode).toBe(429);
    expect(parsed.cacheHit).toBe(true);
    expect(parsed.error).toBe("rate limited");
    expect(parsed.code).toBe("RATE_LIMITED");
    expect(parsed.latencyMs).toBe(150);
  });
});
