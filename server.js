const path = require("path");
const express = require("express");
const next = require("next");

require("./backend/src/config/env");

process.on("uncaughtException", (err) => console.error("[server] Uncaught exception:", err));
process.on("unhandledRejection", (err) => console.error("[server] Unhandled rejection:", err));

const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

async function main() {
  console.log(`[server] Starting in ${dev ? "development" : "production"} mode on port ${PORT}`);

  await require("./backend/src/config/initDb")().catch(() => {});

  const nextApp = next({ dev, dir: path.join(__dirname, "frontend") });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();
  console.log("[server] Next.js ready");

  const app = express();

  app.use(require("cors")(require("./backend/src/config/corsOptions")));
  app.use(express.json());
  app.use(require("morgan")("dev"));
  app.use(require("cookie-parser")());

  app.use("/uploads", express.static(path.join(__dirname, "backend/public/uploads")));
  app.use("/api/v1", require("./backend/src/routes/index"));
  app.use(require("./backend/src/middleware/errorHandler"));

  app.use((req, res) => {
    req.headers.host = req.headers.host || "localhost";
    handle(req, res);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] Fatal error:", err);
  process.exit(1);
});
