import http, { Server } from "http";

import app from "./app";

import seedAdmin from "./app/utils/seedAdmin";
import { envVariables } from "./app/config/env";
import { prisma } from "./app/config/prisma";

let server: Server | null = null;

const connectToDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ SQL Database Connected");
  } catch (err) {
    console.log("❌ Database Connection Failed", err);
  }
};
const startServer = async () => {
  try {
    server = http.createServer(app);
    server.listen(envVariables.PORT, () => {
      console.log(`✅ Server is running on port ${envVariables.PORT}`);
    });

    handleProcessEvents();
  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
};

/**

 * @param {string} signal 
 */
async function gracefulShutdown(signal: string) {
  console.warn(`🔄 Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("✅ HTTP server closed.");

      try {
        console.log("Server shutdown complete.");
      } catch (error) {
        console.error("❌Error during shutdown:", error);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

/**
 * Handle system signals and unexpected errors.
 */
function handleProcessEvents() {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
}

(async () => {
  await seedAdmin();
  await connectToDB();
  await startServer();
})();
