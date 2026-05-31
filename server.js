const express = require("express");
const path = require("path");
const next = require("next");

require("./backend/src/config/env");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "frontend") });
const handle = nextApp.getRequestHandler();
const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  const app = express();

  app.use(require("cors")(require("./backend/src/config/corsOptions")));
  app.use(express.json());
  app.use(require("morgan")("dev"));
  app.use(require("cookie-parser")());

  app.use("/uploads", express.static(path.join(__dirname, "backend/public/uploads")));

  app.use("/api/v1", require("./backend/src/routes/index"));

  app.all("*", (req, res) => handle(req, res));

  app.use(require("./backend/src/middleware/errorHandler"));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
