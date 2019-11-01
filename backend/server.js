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
// app.use(cors({origin: config["origin"], credentials: true})); // Allow CORS
// app.use(cors());
// app.use(cors({
//   // origin: "http://localhost"
//   "allowedHeaders": ["Content-Type"],
//   "origin": "*",
//   "preflightContinue": true
// }));

module.exports.config = config; // Export the configuration to be used by other files
module.exports.db = new (require("./db.js"))(config["mysql"]); // Include
require("./routes.js"); // Include the routes/API endpoints
app.listen(80); // Start the server
