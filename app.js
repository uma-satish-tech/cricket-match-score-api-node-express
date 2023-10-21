const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const sqlite3 = require("sqlite3");

let db = null;
const initializedDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("server started running at localhost:3001");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializedDBAndServer();

dbObjectToResponseObj = (dbObject) => {
  return {
    playerMatchId: dbObject.player_match_id,
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};

// get all players
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM player_details;
    `;
  const all_players = await db.all(getPlayersQuery);
  response.send(all_players.map((each) => dbObjectToResponseObj(each)));
});

// get state

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM player_details WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(dbObjectToResponseObj(player));
});

// update details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updateDetailsQuery = `
    UPDATE player_details 
    SET 
   player_name = '${playerName}';
    `;
  await db.run(updateDetailsQuery);
  response.send("Player Details Updated");
});

// match details of a match

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT * FROM match_details WHERE match_id = ${matchId};
    `;
  const match = await db.get(getMatchDetailsQuery);
  response.send(dbObjectToResponseObj(match));
});

//get all matches of a player played

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchDetailsQuery = `
    SELECT match_details.match_id , match_details.match , match_details.year  FROM player_match_score NATURAL JOIN match_details WHERE player_id = ${playerId};
    `;
  const matches = await db.all(getMatchDetailsQuery);
  response.send(matches.map((each) => dbObjectToResponseObj(each)));
});

//get all players of particular match

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT player_details.player_id AS playerId, player_details.player_name AS playerName
    FROM player_details NATURAL JOIN player_match_score
    WHERE match_id = ${matchId};
    `;
  const matches = await db.all(getMatchDetailsQuery);
  response.send(matches);
});

//get all players stat

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const matches = await db.get(getPlayerScored);
  response.send(matches);
});

module.exports = app;
