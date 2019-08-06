const express      = require("express");              // Server
const bodyParser   = require("body-parser");          // Enables reading POST data
const cookieParser = require("cookie-parser");        // Cookies
const cors         = require("cors");                 // Cross-origin resource sharing
const fs           = require("fs");                   // File system
const yaml         = require("js-yaml");              // Parse .yaml files
const mysql        = require("mysql2");               // MySQL Database
const app          = module.exports = express();      // Define the application
const configObj    = yaml.safeLoad(fs.readFileSync("config.yml", "utf-8"));
const mode         = (process.env.mode == "prod" || process.env.mode == "dev" ? process.env.mode : "local");
const config       = require("lodash/fp/merge")(configObj["global"], configObj[mode]);

app.use(express.static("./static"));                // Define the static directory
app.use(bodyParser.json());                         // Setting for bodyParser
app.use(bodyParser.urlencoded({"extended": true})); // Setting for bodyParser
app.use(cookieParser());                            // Enable cookie parsing
app.use(cors({origin: config["origin"], credentials: true})); // Allow CORS

module.exports.config = config;
module.exports.db     = mysql.createPool({
  "host"           : config["mysql"]["host"],
  "user"           : config["mysql"]["user"],
  "password"       : config["mysql"]["password"],
  "database"       : config["mysql"]["database"],
  "connectionLimit": 20
}).promise();

// Include the routes/API endpoints and then start the server
require("./routes.js");
app.listen(80);
