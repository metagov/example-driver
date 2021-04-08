const express = require("express");
const axios = require("axios");
const sleep = require("util").promisify(setTimeout);

const app = express();
const port = 3000;

const DRIVER_URL = `http://127.0.0.1:${port}`;
const METAGOV_SERVER = "http://127.0.0.1:8000";
const COMMUNITY = "my-community-1234";

// TODO: listen for events from metagov

app.get("/", (req, res) => res.send("Hello world!"));

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

  const response = await instance.put(
    `/api/internal/community/${COMMUNITY}`,
    data
  );
  console.log("Community:");
  console.dir(response.data, { depth: null, colors: true });

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
  console.dir(actionResponse.data, { depth: null, colors: true });

  /********* Perform an asynchronous governance process **********/

  console.log("\nStarting an asynchronous governance process...");
  const delay = 1;
  const processData = {
    options: ["one", "two", "three"],
    delay: delay,
  };

  const processResponse = await instance.post(
    "/api/internal/process/randomness.delayed-stochastic-vote",
    processData
  );

  const processLocation = processResponse.headers["location"];
  console.log(
    `Started async voting process! Expecting result in ${delay} minutes. Polling for result at location: ${processLocation}`
  );
  let resp = await instance.get(processLocation);
  console.dir(resp.data, { depth: null, colors: true });

  (async function main() {
    while (resp.data.status === "pending") {
      console.log("Polling...");
      await sleep(2000);
      resp = await instance.get(processLocation);
    }
    console.log("Async process completed!");
    console.dir(resp.data, { depth: null, colors: true });
  })();
});
