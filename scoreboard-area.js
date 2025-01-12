async function loadCSVData() {
  try {
    const response = await fetch("2023CSVSchedule_Week_14.csv");
    const data = await response.text();
    const rows = data.split("\n").map((row) => row.split(","));

    const headers = rows[0];
    const dataRows = rows.slice(1);
    const scoreboardArea = document.getElementById("scoreboard-area");
    scoreboardArea.innerHTML = ""; // Clear existing content

    dataRows.forEach((row, rowIndex) => {
      if (row.length > 1) {
        const gameData = {};
        headers.forEach((header, index) => {
          gameData[header.trim()] = row[index].trim();
        });

        const GameID = gameData["GameID"];
        if (GameID) {
          // Create scoreboard tile
          const scoreboardTile = document.createElement("div");
          scoreboardTile.classList.add("score_tile");
          scoreboardTile.setAttribute("id", `csv-game-${GameID}`);
          scoreboardTile.setAttribute("onclick", "toggleDetails(this)");

          scoreboardTile.innerHTML = `
            <div class="score_wrapper">
                    <div class="team-scores">
                        <div class="away_score">0</div>
                        <div class="time">${gameData["Time"] || ""}</div>
                        <div class="home_score">0</div>
                    </div>
                    <div class="score-summary">
                        <div class="away-team">${
                          gameData["VisTmShort"] || ""
                        }</div>
                        <div class="day">${gameData["Day"] || ""}</div>
                        <div class="home-team">${
                          gameData["HomeTmShort"] || ""
                        }</div>
                    </div>
                    <div class="score-summary">
                        <div class="down-and-distance-tile">Down and Distance</div>
                    </div>
                    <div class="score-summary">
                        <div class="last-play-tile">Last Play: Click to Expand/Collapse</div>
                    </div>
                </div>
                <div class="container-other">
                    <div class="current-name-and-score">
                        <div class="winning-name-other">CURRENT SCORE WINNING NAME</div>
                        <div class="winning-score-other">00</div>
                    </div>
                    <div class="container-other-header">
                        <div class="away-winner-header">If ${
                          gameData["VisTmShort"]
                        } scores...</div>
                        <div class="spacer-header"></div>
                        <div class="home-winner-header">If ${
                          gameData["HomeTmShort"]
                        } scores...</div>
                    </div>
                    <div class="row-plus-1">
                        <div class="winning-name-away-plus-1">Name AwayScore + 1</div>
                        <div class="spacer">+1 pt</div>
                        <div class="winning-name-home-plus-1">Name HomeScore + 1</div>
                    </div>
                    <div class="row-plus-3">
                        <div class="winning-name-away-plus-3">Name AwayScore + 3</div>
                        <div class="spacer">+3 pts</div>
                        <div class="winning-name-home-plus-3">Name HomeScore + 3</div>
                    </div>
                    <div class="row-plus-6">
                        <div class="winning-name-away-plus-6">Name AwayScore + 6</div>
                        <div class="spacer">+6 pts</div>
                        <div class="winning-name-home-plus-6">Name HomeScore + 6</div>
                    </div>
                    <div class="footer-info">
                        <div class="line-row">
                            <div class="spread">Line:</div>
                            <div class="expected-outcome">Expected</div>
                            <div class="trended-outcome">Trending</div>
                        </div>
                        <div class="total-row">
                            <div class="total">O/U:</div>
                            <div class="expected-outcome-score">xx - xx</div>
                            <div class="trended-outcome-score">xx - xx</div>
                        </div>
                    </div>
                </div>
          `;

          // Append the scoreboard tile to the scoreboard area
          const scoreboardArea = document.getElementById("scoreboard-area");
          scoreboardArea.appendChild(scoreboardTile);
        }
      }
    });
  } catch (error) {
    console.error("Error loading CSV data:", error);
  }
}

function toggleDetails(element) {
  const containerOther = element.querySelector(".container-other");
  if (
    containerOther.style.display === "none" ||
    containerOther.style.display === ""
  ) {
    containerOther.style.display = "block";
  } else {
    containerOther.style.display = "none";
  }
}

loadCSVData();
