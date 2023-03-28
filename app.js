const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeCricketDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeCricketDBAndServer();

//Get Player ApI

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team ;
    `;
  const playersList = await db.all(getPlayersQuery);
  response.send(
    playersList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Post Player API
app.post("/players/", async (require, response) => {
  const playerDetails = require.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
    INSERT INTO 
    cricket_team(player_name, jersey_number, role)
    VALUES (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
        
    );
    `;
  await db.run(addPlayer);
  response.send("Player Added to Team");
});

//Get Single player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// PUT players API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
   UPDATE cricket_team
   SET 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
   WHERE 
        player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Delete Player API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
