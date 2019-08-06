const app    = require("./server.js");
const db     = require("./server.js").db;
const config = require("./server.js").config;
const fs     = require("fs");
const axios  = require("axios");
axios.defaults.validateStatus = false;

app.use(async function(req, res, next) {
  config["secretToken"] = "^VVdum87ujqqxUSF@C*ofA6d3c#k*vxje6&g7iXtNgLnVvj#Kl%uDq!9YbdE2FGI";
  console.log(">>>", config["secretToken"]);
  console.log(">>>", req["cookies"]["secret-token"]);

  if(req["cookies"]["secret-token"] == config["secretToken"]) {
    next();
  } else {
    res.status(401).send();
  }
});

app.get("/data", async (req, res) => {
  console.log("GET");
  let [results] = await db.query("SELECT * FROM sample_table");
  console.log(results);
  res.json(results);
});

app.post("/data", (req, res) => {
  let body = req["body"];
  console.log("POST");
  console.log(body);
  res.json({"1": "2"});
});

app.put("/data", (req, res) => {
  console.log("PUT");
  res.json({});
});

app.delete("/data", (req, res) => {
  console.log("DELETE");
  res.json({});
});

app.use((req, res) => {
  res.status(404);
});
