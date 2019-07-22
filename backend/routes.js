const app    = require("./server.js");
const db     = require("./server.js").db;
const config = require("./server.js").config;
const fs     = require("fs");
const axios  = require("axios");
axios.defaults.validateStatus = false;

let index = 3;
let sampleData = {
  "1": "The key of this is 1",
  "2": "The key of this is 2",
  "3": "The key of this is 3"
};

app.get("/data", async (req, res) => {
  res.json(sampleData);
});

app.post("/data", (req, res) => {
  index++;

  sampleData[index] = `The key of this is ${index}`;
  res.json(sampleData);
});

app.put("/data", (req, res) => {
  for(let key in sampleData) {
    sampleData[key] = "The value has been reset";
  }

  res.json(sampleData);
});

app.delete("/data", (req, res) => {
  let firstKey = Object.keys(sampleData)[0];
  delete sampleData[firstKey];

  res.json(sampleData);
});

app.get("/", async (req, res) => {
  var string = "A string from the server.";

  res.json({
    "string": string
  });
});

app.get("/about", (req, res) => {
  res.json({
    "hello": "world"
  });
});

app.use((req, res) => {
  res.status(404);
});
