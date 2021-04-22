const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();
const port = 3000;

const DRIVER_URL = `http://127.0.0.1:${port}`;
const METAGOV_SERVER = process.env.METAGOV_SERVER;
const COMMUNITY = "my-community-1234";

const prettyprint = (response) => {
  console.dir(response.data, { depth: null, colors: true });
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello world!"));

app.post("/loomio-vote-result", (req, res) => {
  console.log(">> Received vote result:");
  console.log(req.body);
  res.send();
});

app.listen(port, async () => {
  console.log(`Driver listening on port ${port}!`);
  console.log("\nCreating community with the 'randomness' plugin enabled...");

  const instance = axios.create({
    baseURL: METAGOV_SERVER,
  });

  /********* Create a community **********/
  const data = {
    name: COMMUNITY,
    readable_name: "miri's community",
    plugins: [
      {
        name: "randomness",
        config: {
          default_low: 0,
          default_high: 100,
        },
      },
    ],
  };
  if (process.env.LOOMIO_API_KEY) {
    data.plugins.push({
      name: "loomio",
      config: {
        api_key: process.env.LOOMIO_API_KEY,
      },
    });
  }

  const response = await instance.put(
    `/api/internal/community/${COMMUNITY}`,
    data
  );
  console.log("Community:");
  prettyprint(response);

  const hooks = await instance.get(
    `/api/internal/community/${COMMUNITY}/hooks`
  );

  console.log(
    "\n🚨  Register these webhook receivers with the appropriate services (if applicable):"
  );
  hooks.data.hooks.forEach((str) => {
    console.log(METAGOV_SERVER + str);
  });

  /********* Perform an action **********/

  console.log("\nPerforming an action...");
  const actionData = {
    parameters: {
      low: 0,
      high: 10,
    },
  };

  instance.defaults.headers.common["X-Metagov-Community"] = COMMUNITY;

  const actionResponse = await instance.post(
    "/api/internal/action/randomness.random-int",
    actionData
  );

  console.log("Action response:");
  prettyprint(actionResponse);

  /********* Perform an asynchronous governance process **********/
  if (process.env.LOOMIO_API_KEY) {
    console.log("\nStarting Loomio vote...");
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    const closing_at = dt.toISOString().substring(0, 10);
  
    const processResponse = await instance.post(
      "/api/internal/process/loomio.poll",
      {
        callback_url: `${DRIVER_URL}/loomio-vote-result`,
        title: "what should happen?",
        options: ["one", "two", "three"],
        details: "Created by example Driver. Poll closes in 1 day.",
        closing_at: closing_at,
      }
    );
  
    const processLocation = processResponse.headers["location"];
    console.log(`Started Loomio vote! Expecting result in 1 day.`);
    let resp = await instance.get(processLocation);
    body = resp.data;
    console.dir(body, { depth: null, colors: true });
    console.log(`Go to the poll_url to close the vote early.`);
  }
});
