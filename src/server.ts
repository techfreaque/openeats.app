import "dotenv/config";

import { createServer } from "http";
import next from "next";
import { initApiLibrary } from "next-vibe/server/endpoints/core/init-api-library";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";
import { parse } from "url";

import { env } from "./config/env";
import { envClient } from "./config/env-client";

const dev = env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

void app
  .prepare()
  .then(() => {
    // Create HTTP server
    const server = createServer(async (req, res) => {
      try {
        // Parse URL
        const parsedUrl = parse(req.url ?? "", true);

        // Let Next.js handle the request
        await handle(req, res, parsedUrl);
      } catch (err) {
        errorLogger("Error occurred handling request", err, req.url);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    // Initialize API library with WebSocket support
    initApiLibrary({
      httpServer: server,
      webSocket: {
        enabled: true,
        path: "/api/ws",
        corsOrigin: dev ? "*" : envClient.NEXT_PUBLIC_BACKEND_URL,
      },
    });

    // Start the server
    server.listen(port, () => {
      debugLogger(`Server ready on http://${hostname}:${port}`);
    });

    return server; // Return server for promise chaining
  })
  .catch((err) => {
    errorLogger("Error starting server:", err);
    process.exit(1);
  });
