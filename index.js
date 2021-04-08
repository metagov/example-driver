const express = require("express");
const request = require("request");

const app = express();
const port = 3000;

const METAGOV_SERVER = "http://127.0.0.1:8000";
const community_slug = "my-community-1234";

// TODO: listen for events from metagov
// TODO: perform metagov actions
// TODO: perform async metagov process and wait for result

app.get("/", (req, res) => res.send("Hello world!"));

app.listen(port, () => {
  console.log(`Driver listening on port ${port}!`);
  console.log("Creating community with the 'randomness' plugin enabled...");

  const options = {
    method: "PUT",
    url: `${METAGOV_SERVER}/api/internal/community/${community_slug}`,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: community_slug,
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
    }),
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log("Community:");
    console.dir(JSON.parse(response.body), { depth: null, colors: true });
  });
});
