var express      = require("express");              // Express
var fs           = require("fs");                   // File system
var yaml         = require("js-yaml");              // Parse .yaml files
var mysql        = require("mysql2");               // MySQL Database
var bodyParser   = require("body-parser");          // Allows you to read POST data
var cookieParser = require("cookie-parser");        // Cookies
var cors         = require("cors");
var app          = module.exports = express();      // Define the application

var config = yaml.safeLoad(fs.readFileSync("config.yml", "utf-8"));

// Get the environment mode; this should be either "local", "dev", or "prod"
var mode = process.env.mode || "local";

app.set("views", "./views");                         // Define the views directory
// app.use(sass({src:   __dirname + "/static/css/sass", // Set SASS directory for the source
//               dest:  __dirname + "/static/css",      // Set SASS directory for the destination
//               prefix: "/css",                        // Set SASS prefix
//               outputStyle: "compressed"}));          // Set SASS compression
app.use(express.static("./static"));                 // Define the static directory
app.use(bodyParser.json());                          // Setting for bodyParser
app.use(bodyParser.urlencoded({extended: true}));    // Setting for bodyParser
app.use(cookieParser());                             // Enable cookie parsing
app.use(cors());                                     // Allow CORS

module.exports.config = config;
module.exports.db   = mysql.createPool({
  "host"           : config[mode]["mysql"]["host"],
  "user"           : config[mode]["mysql"]["user"],
  "password"       : config[mode]["mysql"]["password"],
  "database"       : config[mode]["mysql"]["database"],
  "connectionLimit": 20
}).promise();
require("./routes.js"); // Include web routes third
app.listen(80);         // Start the server
