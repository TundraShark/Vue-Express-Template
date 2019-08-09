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
  let [results] = await db.query("SELECT * FROM sample_table");
  res.json(results);
});

app.post("/data", async (req, res) => {
  let name = req["body"]["name"];
  let age  = req["body"]["age"];
  let sql  = "INSERT INTO sample_table (name, age) VALUES (?, ?)";
  let args = [name, age];
  await db.query(sql, args);
  let [results] = await db.query("SELECT * FROM sample_table");
  res.json(results);
});

app.put("/data", async (req, res) => {
  let id   = req["body"]["id"];
  let name = req["body"]["name"];
  let age  = req["body"]["age"];
  let sql  = "UPDATE sample_table SET name=?, age=? WHERE id=?";
  let args = [name, age, id];
  await db.query(sql, args);
  let [results] = await db.query("SELECT * FROM sample_table");
  res.json(results);
});

app.delete("/data", async (req, res) => {
  let id   = req["query"]["id"];
  let sql  = "DELETE FROM sample_table WHERE id=?";
  let args = [id];
  await db.query(sql, args);
  let [results] = await db.query("SELECT * FROM sample_table");
  res.json(results);
});

app.use((req, res) => {
  res.status(404).send();
});
