import type { IncomingMessage, ServerResponse } from "http";

let app: any;
let loadError: unknown;

try {
  app = (await import("../src/server.js")).default;
} catch (e) {
  loadError = e;
  console.error("Startup crash:", e);
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (loadError) {
    const err = loadError as Error;
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end(err?.stack || String(err));
    return;
  }
  return app(req, res);
}