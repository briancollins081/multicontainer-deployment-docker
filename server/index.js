const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");
const { Pool } = require("pg");

const keys = require("./keys");

// Express server
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgress client
console.log({ keys });
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pgClient.on("error", () => {
  console.log("PG Connection lost");
});

pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch((err) => console.log(err));

// Redis client setup
const redisClient = redis.createClient(keys.redisPort, keys.redisHost, {
  no_ready_check: true,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

//routes
app.get("/", (req, res) => {
  res.send("Hi there!");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  console.log("values/all", values);
  res.send(values.rows);
});

app.get("/values/current", (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    console.log("values/current", values);
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) {
    res.status(422).send("Index is too high!");
  }
  
  redisClient.hset("values", index, "Nothing yet");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES ($1)", [index]);

  res.send({ working: true });
});

app.listen(5000, () => {
  console.log("Server Listening on port 5000");
});
