import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Explicit cleanup — RTL auto-cleanup may not detect vitest 3.x.
afterEach(cleanup);

// Mock `server-only` — it throws at import time outside a React Server Component.
vi.mock("server-only", () => ({}));
