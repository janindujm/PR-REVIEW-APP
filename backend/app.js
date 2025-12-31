const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");

require("dotenv").config();


console.log("Mongo URI:", process.env.MONGO_URI);

const controller = require("./controller");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple webhook route
app.post("/webhook", controller.handleWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
