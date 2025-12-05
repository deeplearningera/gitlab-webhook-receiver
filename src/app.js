const express = require("express");
const routes = require("./routes");
require("dotenv").config();
const routes = require("./routes");

const app = express();

app.use(bodyParser.json({ limit: "2mb" })); // Large diffs possible
app.use("/", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 GitLab Webhook Receiver running on port ${PORT}`);
});

