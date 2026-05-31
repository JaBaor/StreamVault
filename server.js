const http = require("http");
const path = require("path");
const next = require("next");

require("./backend/src/config/env");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "frontend") });
const handle = nextApp.getRequestHandler();
const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  const express = require("express");
  const apiApp = express();

  apiApp.use(require("cors")(require("./backend/src/config/corsOptions")));
  apiApp.use(express.json());
  apiApp.use(require("morgan")("dev"));
  apiApp.use(require("cookie-parser")());

  apiApp.use("/uploads", express.static(path.join(__dirname, "backend/public/uploads")));
  apiApp.use("/api/v1", require("./backend/src/routes/index"));
  apiApp.use(require("./backend/src/middleware/errorHandler"));

  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/api/v1") || req.url.startsWith("/uploads")) {
      apiApp(req, res);
    } else {
      req.headers.host = req.headers.host || "localhost";
      handle(req, res);
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
