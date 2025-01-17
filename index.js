const express = require("express");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const PORT = 3000;

const API_BASE_URL = "http://localhost:8081";
const API_KEY = "e4e7429f03466153a314a5e82612d57b18f9778f70be38d5ff2bd58d619826c2";

app.use(express.json());

const generateGUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const createRequestConfig = (method, url, apiKey) => ({
  method,
  url: `${API_BASE_URL}${url}`,
  headers: {
    "Content-Type": "application/json",
    "x-killers-api-key-x": `${apiKey}`,
    "context-id": `${generateGUID()}`,
    "request-source": `Killers_Task`,
  },
});

app.get("/trigger-all-tasks", async (req, res) => {
  try {
    const apiKey = req.headers["x-killers-api-key-x"];

    console.log("GET /trigger-all-tasks");

    let startTime = new Date();
    await callHourlyTasks(apiKey, "season");
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    res.status(200).json({ success: true, message: "All tasks completed in : " + timeDifference / 1000 + "s." });
  } catch (error) {
    console.error("Error calling target API:", error.message);
    res.status(500).json({ success: false, message: "Failed to call target API" });
  }
});

const callHourlyTasks = async (apiKey, updateFixtures) => {
  // /get-season-fixtures
  try {
    let startTime = new Date();
    const fixtureResponse = await axios(createRequestConfig("GET", "/fixtures/tasks/get-season-fixtures", apiKey));
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    console.log(
      "/get-season-fixtures: " + fixtureResponse.status + " started at: " + JSON.stringify(startTime) + " ended at: " + JSON.stringify(finishTime),
      " Total time: " + timeDifference + "ms"
    );
  } catch (error) {
    console.error("Error calling /get-season-fixtures:", error.message);
  }

  // /update-deadlines
  try {
    let startTime = new Date();
    const updateRoundDeadlineResponse = await axios(createRequestConfig("GET", "/rounds/tasks/update-deadlines", apiKey));
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    console.log(
      "/update-deadlines: " + updateRoundDeadlineResponse.status + " started at: " + JSON.stringify(startTime) + " ended at: " + JSON.stringify(finishTime),
      " Total time: " + timeDifference + "ms"
    );
  } catch (error) {
    console.error("Error calling /update-deadlines:", error.message);
  }

  // disable-invalid-games
  try {
    let startTime = new Date();
    const disableInvalidGamesResponse = await axios(createRequestConfig("GET", "/games/tasks/disable-invalid-games", apiKey));
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    console.log(
      "/disable-invalid-games: " +
        disableInvalidGamesResponse.status +
        " started at: " +
        JSON.stringify(startTime) +
        " ended at: " +
        JSON.stringify(finishTime),
      " Total time: " + timeDifference + "ms"
    );
  } catch (error) {
    console.error("Error calling /disable-invalid-games:", error.message);
  }

  // /auto-populate-all-missing-user-choices
  try {
    let startTime = new Date();
    const populateMissingChoicesResponse = await axios(createRequestConfig("GET", "/games/tasks/auto-populate-all-missing-user-choices", apiKey));
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    console.log(
      "/auto-populate-all-missing-user-choices: " +
        populateMissingChoicesResponse.status +
        " started at: " +
        JSON.stringify(startTime) +
        " ended at: " +
        JSON.stringify(finishTime),
      " Total time: " + timeDifference + "ms"
    );
  } catch (error) {
    console.error("Error calling /auto-populate-all-missing-user-choices:", error.message);
  }

  // /update-lives
  try {
    let startTime = new Date();
    const updateUserLivesResponse = await axios(createRequestConfig("GET", "/games/tasks/update-lives?updateFixtures=" + updateFixtures, apiKey));
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    console.log(
      "/update-lives?updateFixtures=" +
        updateFixtures +
        ": " +
        updateUserLivesResponse.status +
        " started at: " +
        JSON.stringify(startTime) +
        " ended at: " +
        JSON.stringify(finishTime),
      " Total time: " + timeDifference + "ms"
    );
  } catch (error) {
    console.error("Error calling /update-lives:", error.message);
  }

  // /select-game-winners
  try {
    let startTime = new Date();
    const updateGameWinnersResponse = await axios(createRequestConfig("GET", "/games/tasks/select-game-winners", apiKey));
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    console.log(
      "/select-game-winners: " + updateGameWinnersResponse.status + " started at: " + JSON.stringify(startTime) + " ended at: " + JSON.stringify(finishTime),
      " Total time: " + timeDifference + "ms"
    );
  } catch (error) {
    console.error("Error calling /select-game-winners:", error.message);
  }

  // /tasks/process-finished-games
  try {
    let startTime = new Date();
    const updateGameWinnersResponse = await axios(createRequestConfig("GET", "/tasks/process-finished-games", apiKey));
    let finishTime = new Date();
    let timeDifference = finishTime.getTime() - startTime.getTime();

    console.log(
      "/tasks/process-finished-games: " +
        updateGameWinnersResponse.status +
        " started at: " +
        JSON.stringify(startTime) +
        " ended at: " +
        JSON.stringify(finishTime),
      " Total time: " + timeDifference + "ms"
    );
  } catch (error) {
    console.error("Error calling /tasks/process-finished-games:", error.message);
  }
};

// Schedule the job to run every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running hourly tasks at" + JSON.stringify(new Date()));

  let startTime = new Date();
  const currentHour = startTime.getHours();
  if (currentHour >= 10 && currentHour < 23) {
    await callHourlyTasks(API_KEY, "day");
  } else {
    console.log("Not calling hourly tasks as time does not fall between 9am and 10pm.");
  }
  let finishTime = new Date();
  let timeDifference = finishTime.getTime() - startTime.getTime();

  console.log("Hourly tasks completed in: " + timeDifference / 1000 + "s.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  (async () => {
    try {
      let startTime = new Date();
      await callHourlyTasks(API_KEY, "day");
      let finishTime = new Date();
      let timeDifference = finishTime.getTime() - startTime.getTime();

      console.log("Hourly tasks completed in: " + timeDifference / 1000 + "s.");
    } catch (error) {
      console.error("Error executing hourly tasks:", error);
    }
  })();
});
