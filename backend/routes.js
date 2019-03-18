var app = require("./server.js");
var db  = require("./server.js").db;
var fs  = require("fs"); // File system library

app.post("/add-person", (req, res) => {
  AppendToFile("data/people.csv", req.body);
  var people = CsvToObject("data/people.csv");
  res.json(people);
});

app.get("/", async (req, res) => {
  var string = "A string from the server.";

  res.json({
    "string": string
  });
});

app.get("/get-data", async (req, res) => {
  var [people] = await db.query("SELECT id, name, age FROM sample");

  res.json({
    "people": people
  });
});

app.get("/about", (req, res) => {
  var people = CsvToObject("data/people.csv");
  res.json({
    "people": people
  });
});

app.use((req, res) => {
  res.status(404);
});
