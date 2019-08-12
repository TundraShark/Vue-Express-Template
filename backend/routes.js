const app    = require("./server.js");
const db     = require("./server.js").db;
const config = require("./server.js").config;
const fs     = require("fs");
const axios  = require("axios");
axios.defaults.validateStatus = false;

app.use(async function(req, res, next) {
  config["secretToken"] = "^VVdum87ujqqxUSF@C*ofA6d3c#k*vxje6&g7iXtNgLnVvj#Kl%uDq!9YbdE2FGI";

  // Authenticate the client
  if(req["cookies"]["secret-token"] == config["secretToken"]) {
    next();
  } else {
    res.status(401).send();
  }
});

app.get("/data", async (req, res) => {
  let results = await db.GetData();
  res.json(results);
});

app.post("/data", async (req, res) => {
  let name = req["body"]["name"];
  let age  = req["body"]["age"];
  let results = await db.PostData(name, age);
  res.json(results);
});

app.put("/data", async (req, res) => {
  let id   = req["body"]["id"];
  let name = req["body"]["name"];
  let age  = req["body"]["age"];
  let results = await db.PutData(id, name, age);
  res.json(results);
});

app.delete("/data", async (req, res) => {
  let id = req["query"]["id"];
  let results = await db.DeleteData(id);
  res.json(results);
});

app.use((req, res) => {
  res.status(404).send();
});
