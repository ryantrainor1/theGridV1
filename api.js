// api.js

// Initialize the API listener when this script is loaded
initializeAPIListeners();
// Function to initialize and set up event listener for grid completion
function initializeAPIListeners() {
  // Listen for the custom event from grid.js (gridFilledAndSaved)
  document.addEventListener("gridFilledAndSaved", (event) => {
    const finalizedGridState = event.detail.gridState;
    console.log(
      "Received finalized gridState in web3Connect.js:",
      finalizedGridState
    );

    // Perform operations with the finalized gridState
    startAPIOperations(finalizedGridState); // Example function to send to API
  });
}

// Function to verify grid completion - ensuring stakedUsers has 100 entries
function verifyGridCompletion(gridState) {
  const totalFilledSpaces = Object.keys(gridState).length;
  const allGridValuesAssigned = Object.values(gridState).every(
    (space) => space.gridValue
  );

  if (totalFilledSpaces === 100 && allGridValuesAssigned) {
    console.log("Grid is fully populated with values.");
    startAPIOperations(gridState);
  } else {
    console.error(
      `Grid incomplete: ${totalFilledSpaces} spaces filled, grid values incomplete.`
    );
  }
}

// Function to start API operations after grid verification
function startAPIOperations(gridState) {
  console.log("API operations starting...");

  // Here, call functions to handle API data processing (to be defined)
  fetchAndProcessAPIScores(gridState);

  // Set up a periodic API data refresh (every minute, for example)
  setInterval(() => fetchAndProcessAPIScores(grid), 60000);
}

// Initialize a set to track processed games
const processedGames = new Set();

// Fetch and process API scores, updating the scoreboard and handling game completion
async function fetchAndProcessAPIScores(gridState) {
  try {
    const response = await fetch("http://localhost:3000/api/scores"); // Replace with your actual API URL
    const data = await response.json();
    console.log("API Data Fetched Successfully:", data);

    // Process each game received from the API
    data.forEach((game) => {
      const gameID = game.GameID;
      const scoreboardTile = document.querySelector(`#csv-game-${gameID}`);

      if (!scoreboardTile) {
        console.error(`Scoreboard tile not found for GameID: ${gameID}`);
        return;
      }

      // Update expected and trending scores
      updateExpectedAndTrendingScores(scoreboardTile, game);

      // Extract away and home scores from the game object
      const awayScore = game.Score.AwayScore;
      const homeScore = game.Score.HomeScore;

      // Skip this game if it has already been processed
      if (processedGames.has(gameID)) {
        console.log(`Game ${gameID} has already been processed. Skipping...`);
        return;
      }

      // Handle games that are in progress
      if (game.Score.IsInProgress) {
        updateScoreboardInProgress(game, scoreboardTile, gridState);
      }

      // Handle games that are finished
      if (game.Score.IsOver && !processedGames.has(gameID)) {
        handleGameCompletion(game, scoreboardTile, gridState);

        // Mark the game as processed to avoid reprocessing
        processedGames.add(gameID);
      }

      // Pass necessary arguments to updateProspectiveWinners
      updateProspectiveWinners(scoreboardTile, awayScore, homeScore, gridState);
    });
  } catch (error) {
    console.error("Error fetching API data:", error);
  }
}

// Function to update the UI for in-progress games
function updateScoreboardInProgress(game, scoreboardTile, gridState) {
  const {
    AwayScore,
    HomeScore,
    TimeRemaining,
    Quarter,
    LastPlay,
    AwayTeam,
    HomeTeam,
    PointSpread,
    OverUnder,
  } = game.Score;

  // Update basic score info
  const awayScoreElement = scoreboardTile.querySelector(".away_score");
  const homeScoreElement = scoreboardTile.querySelector(".home_score");
  const timeElement = scoreboardTile.querySelector(".time");
  const dayElement = scoreboardTile.querySelector(".day");
  const lastPlayTile = scoreboardTile.querySelector(".last-play-tile");
  const spreadElement = scoreboardTile.querySelector(".spread");
  const totalElement = scoreboardTile.querySelector(".total");

  if (awayScoreElement) awayScoreElement.innerText = AwayScore || "0";
  if (homeScoreElement) homeScoreElement.innerText = HomeScore || "0";
  if (timeElement)
    timeElement.innerText = TimeRemaining ? TimeRemaining : "END";

  // Update the quarter info
  const quarterMapping = {
    1: "Q1",
    2: "Q2",
    HALF: "HALF",
    3: "Q3",
    4: "Q4",
    OT: "OT",
  };
  if (dayElement) dayElement.innerText = quarterMapping[Quarter] || "";

  // Update the last play
  if (lastPlayTile)
    lastPlayTile.innerText = LastPlay || "Last Play: Click to Expand/Collapse";

  // Update spread and total (O/U)
  if (spreadElement)
    spreadElement.innerText = `Line: ${HomeTeam} ${PointSpread || ""}`;
  if (totalElement) totalElement.innerText = `O/U: ${OverUnder || ""}`;

  // Call to calculate prospective winner
  updateProspectiveWinners(scoreboardTile, AwayScore, HomeScore, gridState);
  // Call any additional functions, such as updating down and distance, etc.
  updateDownAndDistance(game.Score, scoreboardTile);
}

//FUNCTIONS TO HANDLE THE EXPANDED SECTION ON THE SCOREBOARD TILES
function updateDownAndDistance(score, scoreTile) {
  const downAndDistanceDiv = scoreTile.querySelector(".down-and-distance-tile");

  if (downAndDistanceDiv) {
    // Check if the element exists before setting innerText
    const downAndDistance = score.DownAndDistance;
    const yardLineTerritory = score.YardLineTerritory; // e.g., "GB"
    const yardLine = score.YardLine; // e.g., "45"

    if (downAndDistance) {
      downAndDistanceDiv.innerText = `${downAndDistance} at ${yardLineTerritory} ${yardLine}`;
    } else {
      downAndDistanceDiv.innerText = "Down and Distance: N/A";
    }
  }
}

// Function to handle games that are complete
function handleGameCompletion(game, scoreboardTile, gridState) {
  const awayScoreElement = scoreboardTile.querySelector(".away_score");
  const homeScoreElement = scoreboardTile.querySelector(".home_score");
  const timeElement = scoreboardTile.querySelector(".time");
  const dayElement = scoreboardTile.querySelector(".day");

  const { AwayScore, HomeScore } = game.Score;

  // Display final scores
  if (awayScoreElement) awayScoreElement.innerText = AwayScore || "0";
  if (homeScoreElement) homeScoreElement.innerText = HomeScore || "0";

  // Mark the game as FINAL
  if (dayElement) dayElement.innerText = "FINAL";
  if (timeElement) timeElement.innerText = "";

  // Calculate the winning number and update the scoreboard
  const winningNumber = calculateWinningNumber(AwayScore, HomeScore);
  const winningGridCell = Object.keys(gridState).find(
    (gridId) => gridState[gridId]?.gridValue === winningNumber
  );

  let winningUser = null;

  if (winningGridCell) {
    // Retrieve the user associated with the winning grid cell
    winningUser = {
      name: gridState[winningGridCell]?.walletAddress || "Unknown User",
      gridId: winningGridCell,
    };

    // Update the user's wins and winnings in gridState
    if (!gridState[winningGridCell].wins) gridState[winningGridCell].wins = 0;
    if (!gridState[winningGridCell].winnings)
      gridState[winningGridCell].winnings = 0;

    gridState[winningGridCell].wins += 1; // Increment wins
    gridState[winningGridCell].winnings += 1; // Add winnings (assuming $1 per win)
    console.log(
      `Updated User: ${winningUser.name} now has ${gridState[winningGridCell].wins} wins and $${gridState[winningGridCell].winnings} in winnings.`
    );

    // Update the leaderboard display in grid.js by calling the function there
    if (typeof window.updateLeaderboardDisplay === "function") {
      window.updateLeaderboardDisplay();
    }
  } else {
    console.log(`No user found with winning number: ${winningNumber}`);
  }

  // Update the scoreboard with final winner and score
  // Use shortenAddress for winner display
  const shortenedName = winningUser
    ? shortenAddress(winningUser.name)
    : "No Winner";
  scoreboardTile.querySelector(
    ".winning-name-other"
  ).innerText = `WINNER: ${shortenedName}`;
  scoreboardTile.querySelector(
    ".winning-score-other"
  ).innerText = `${winningNumber}`;
}

// Function to check if all games are processed
function allGamesProcessed() {
  const totalGames = document.querySelectorAll(".scoreboard-tile").length;
  return processedGames.size === totalGames; // processedGames keeps track of completed games
}

// Helper function to shorten the wallet address
function shortenAddress(address) {
  if (!address || address.length < 10) return address; // Handle invalid or short addresses
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to calculate the winning number from the scores
function calculateWinningNumber(awayScore, homeScore) {
  const awayLastDigit = awayScore % 10;
  const homeLastDigit = homeScore % 10;
  return `${awayLastDigit}${homeLastDigit}`;
}

// Helper function to find the user with the matching random value
// Helper function to find the user with the matching grid value
function findWinningUser(winningNumber, gridState) {
  for (const gridId of Object.keys(gridState)) {
    const gridData = gridState[gridId];
    if (
      gridData &&
      String(gridData.gridValue).padStart(2, "0") === winningNumber &&
      gridData.walletAddress // Ensure a wallet address is associated
    ) {
      return {
        name: gridData.walletAddress, // Use walletAddress as the user identifier
        gridId: gridId,
        wins: gridData.wins || 0,
        winnings: gridData.winnings || 0,
      };
    }
  }
  return null; // No matching user found
}

// Helper function to update the leaderboard after a win
function updateLeaderboard(winningUser) {
  winningUser.wins = (winningUser.wins || 0) + 1;
  winningUser.winnings = (winningUser.wins || 0) * 1; // Example: $1 per win
}

function updateProspectiveWinners(
  scoreboardTile,
  awayScore,
  homeScore,
  gridState
) {
  if (!scoreboardTile || !gridState) {
    console.error("updateProspectiveWinners: Invalid inputs.");
    return;
  }

  // Calculate the current prospective winner
  const currentWinningNumber = calculateWinningNumber(awayScore, homeScore);
  const currentWinningUser = findWinningUser(currentWinningNumber, gridState);
  const currentWinningUserName = currentWinningUser
    ? shortenAddress(currentWinningUser.name)
    : "N/A";

  // Update the prospective winner for the current game state
  scoreboardTile.querySelector(".winning-name-other").innerText =
    currentWinningUserName;
  scoreboardTile.querySelector(".winning-score-other").innerText =
    currentWinningNumber;

  // Helper function to format prospective winners
  function formatProspectiveWinner(awayScore, homeScore) {
    const winningNumber = calculateWinningNumber(awayScore, homeScore);
    const winningUser = findWinningUser(winningNumber, gridState);

    if (winningUser && winningUser.gridId) {
      // Retrieve the gridValue from gridState for the gridId
      const gridValue = gridState[winningUser.gridId]?.gridValue || "N/A";

      // Return formatted address and grid value
      return `${shortenAddress(winningUser.name)} (${gridValue})`;
    } else {
      // Handle undefined or missing data
      return "No data available";
    }
  }

  // Calculate prospective winners for the away team based on future score changes
  scoreboardTile.querySelector(".winning-name-away-plus-1").innerText =
    formatProspectiveWinner(awayScore + 1, homeScore);

  scoreboardTile.querySelector(".winning-name-away-plus-3").innerText =
    formatProspectiveWinner(awayScore + 3, homeScore);

  scoreboardTile.querySelector(".winning-name-away-plus-6").innerText =
    formatProspectiveWinner(awayScore + 6, homeScore);

  // Calculate prospective winners for the home team based on future score changes
  scoreboardTile.querySelector(".winning-name-home-plus-1").innerText =
    formatProspectiveWinner(awayScore, homeScore + 1);

  scoreboardTile.querySelector(".winning-name-home-plus-3").innerText =
    formatProspectiveWinner(awayScore, homeScore + 3);

  scoreboardTile.querySelector(".winning-name-home-plus-6").innerText =
    formatProspectiveWinner(awayScore, homeScore + 6);
}

function calculateExpectedScore(game) {
  const { PointSpread, OverUnder, AwayTeam, HomeTeam } = game.Score;

  if (PointSpread !== null && OverUnder !== null) {
    const homeExpected = Math.round((OverUnder + PointSpread) / 2);
    const awayExpected = Math.round((OverUnder - PointSpread) / 2);
    return { homeExpected, awayExpected, AwayTeam, HomeTeam };
  }

  return { homeExpected: "xx", awayExpected: "xx", AwayTeam, HomeTeam };
}

function calculateTrendingScore(
  currentScore,
  elapsedMinutes,
  totalMinutes,
  expectedScore
) {
  if (elapsedMinutes <= 0) return expectedScore;

  const trend = (currentScore / elapsedMinutes) * totalMinutes;
  return Math.round(trend);
}

function updateExpectedAndTrendingScores(scoreboardTile, game) {
  const totalMinutes = 60; // Total game time in minutes
  const {
    AwayScore,
    HomeScore,
    TimeRemaining,
    PointSpread,
    OverUnder,
    AwayTeam,
    HomeTeam,
  } = game.Score;

  const timeRemainingParts = TimeRemaining ? TimeRemaining.split(":") : [];
  const elapsedMinutes =
    timeRemainingParts.length > 0
      ? totalMinutes - parseInt(timeRemainingParts[0])
      : totalMinutes;

  // Calculate expected scores
  const { homeExpected, awayExpected } = calculateExpectedScore(game);

  // Calculate trending scores
  const trendingAwayScore = calculateTrendingScore(
    AwayScore,
    elapsedMinutes,
    totalMinutes,
    awayExpected
  );
  const trendingHomeScore = calculateTrendingScore(
    HomeScore,
    elapsedMinutes,
    totalMinutes,
    homeExpected
  );

  // Update the scoreboard elements
  const expectedOutcomeScoreElement = scoreboardTile.querySelector(
    ".expected-outcome-score"
  );
  const trendedOutcomeScoreElement = scoreboardTile.querySelector(
    ".trended-outcome-score"
  );

  if (expectedOutcomeScoreElement) {
    expectedOutcomeScoreElement.innerText = `${AwayTeam} ${awayExpected} - ${HomeTeam} ${homeExpected}`;
  }

  if (trendedOutcomeScoreElement) {
    trendedOutcomeScoreElement.innerText = `${AwayTeam} ${trendingAwayScore} - ${HomeTeam} ${trendingHomeScore}`;
  }
}

function clearWinsAndLocalStorage() {
  // Reset wins, winnings, and processedGames in gridState
  Object.entries(gridState).forEach(([gridId, gridData]) => {
    gridData.wins = 0;
    gridData.winnings = 0;
    gridData.processedGames = new Set(); // Clear processed games
  });

  // Save the updated (cleared) gridState to localStorage
  saveAppState();

  // Update the leaderboard and grid display
  updateGridBoard(gridState);
  updateLeaderboard();

  console.log("Wins, winnings, and processed games have been reset.");
}

// Example usage after all games are completed
function handleAllGamesCompleted() {
  const gameResults = [];

  // Loop through each scoreboard-tile and collect game data
  document.querySelectorAll(".score_tile").forEach((scoreboardTile, index) => {
    console.log(`Processing scoreboard tile #${index + 1}:`, scoreboardTile);

    // Correct selectors based on the HTML structure you shared
    const homeTeamElement = scoreboardTile.querySelector(".home-team");
    const awayTeamElement = scoreboardTile.querySelector(".away-team");

    // Ensure the elements are found
    if (!homeTeamElement || !awayTeamElement) {
      console.error("Home or Away team not found in tile:", scoreboardTile);
      return;
    }

    const homeTeam = homeTeamElement.innerText || "N/A";
    const awayTeam = awayTeamElement.innerText || "N/A";
    console.log("Home Team:", homeTeam, "Away Team:", awayTeam);

    // Get the scores using the updated selectors
    const homeScoreElement = scoreboardTile.querySelector(".home_score");
    const awayScoreElement = scoreboardTile.querySelector(".away_score");
    const winningNameElement = scoreboardTile.querySelector(
      ".winning-name-other"
    );
    const winningScoreElement = scoreboardTile.querySelector(
      ".winning-score-other"
    );

    if (
      !homeScoreElement ||
      !awayScoreElement ||
      !winningNameElement ||
      !winningScoreElement
    ) {
      console.error("One or more elements are missing:", {
        homeScoreElement,
        awayScoreElement,
        winningNameElement,
        winningScoreElement,
      });
      return;
    }

    const homeScore = homeScoreElement.innerText || "N/A";
    const awayScore = awayScoreElement.innerText || "N/A";
    const winningName = winningNameElement.innerText || "N/A";
    const winningNumber = winningScoreElement.innerText || "N/A";

    // Push the collected data into the gameResults array
    gameResults.push({
      week: 14, // Adjust this as needed
      "Home Team": homeTeam,
      "Away Team": awayTeam,
      "Home Score": homeScore,
      "Away Score": awayScore,
      "Winning Name": winningName,
      "Winning Number": winningNumber,
    });

    console.log("Current gameResults:", gameResults);
  });

  // Final logging to check the collected results
  console.log("Collected Game Results:", gameResults);

  // If there are results, generate an Excel file; otherwise, log an error
  if (gameResults.length > 0) {
    // Now convert the gameResults into an Excel file using SheetJS
    const worksheet = XLSX.utils.json_to_sheet(gameResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Game Results");

    // Generate the Excel file and trigger the download
    XLSX.writeFile(workbook, "game_results_week_14.xlsx");
  } else {
    console.error("No game results were collected.");
  }
}

export { handleAllGamesCompleted };
export { clearWinsAndLocalStorage };

//////SENDING THE API DATA TO THE WEB3 BLOCKCHAIN SMART CONTRACT////////

// Remove: import { ethers } from "ethers";

// Use ethers directly (global from the CDN)
async function sendApiDataToSmartContract(apiResponse, contractAddress, abi) {
  try {
    // Prepare data
    const gameIDs = [];
    const awayScores = [];
    const homeScores = [];

    apiResponse.forEach((game) => {
      // Use the gameID as-is (string)
      const gameID = game.GameID; // No numeric extraction
      if (!gameID || typeof gameID !== "string") {
        throw new Error(`Invalid gameID: ${game.GameID}`);
      }
      gameIDs.push(gameID);

      // Add scores
      awayScores.push(game.Score.AwayScore);
      homeScores.push(game.Score.HomeScore);
    });

    console.log("Prepared data:", { gameIDs, awayScores, homeScores });

    // Connect to the smart contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Submit data to the smart contract
    const tx = await contract.submitGameScores(gameIDs, awayScores, homeScores);
    console.log("Transaction submitted:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    alert("API data successfully submitted to the smart contract!");
  } catch (error) {
    console.error("Error submitting data to the smart contract:", error);
    alert("Failed to submit API data. Check console for details.");
  }
}

async function handleApiDataSubmission() {
  console.log("handleApiDataSubmission function called!");
  try {
    const response = await fetch("http://localhost:3000/api/scores"); // Replace with your API URL
    console.log("API response received:", response);
    const data = await response.json();
    console.log("Parsed API data:", data);

    const incompleteGames = data.filter((game) => game.IsOver === false);
    if (incompleteGames.length > 0) {
      console.warn("Incomplete games:", incompleteGames);
      alert("Some games are still in progress.");
      return;
    }

    // Proceed to send data to the smart contract
    console.log("All games are completed. Proceeding...");

    // Define the smart contract address and ABI
    const contractAddress = "0x76108A653D9F8B021663Cf35F0F505c0A1712890"; // Payout Contract v13
    const abi = [
      {
        inputs: [
          {
            internalType: "address",
            name: "_nftContractAddress",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenID",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "gridValue",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "winningNumber",
            type: "string",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "isMatch",
            type: "bool",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "payout",
            type: "uint256",
          },
        ],
        name: "DebugMatch",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "string",
            name: "gameID",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "winningNumber",
            type: "string",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "awayScore",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "homeScore",
            type: "uint256",
          },
        ],
        name: "GameResultSubmitted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenID",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "wallet",
            type: "address",
          },
          {
            indexed: false,
            internalType: "string",
            name: "gridValue",
            type: "string",
          },
        ],
        name: "WeeklyDataSubmitted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenID",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "wallet",
            type: "address",
          },
          {
            indexed: false,
            internalType: "string",
            name: "gameID",
            type: "string",
          },
        ],
        name: "WinnerLogged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "wallet",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "WinningsClaimed",
        type: "event",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenID",
            type: "uint256",
          },
        ],
        name: "claimWinningsByToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "fundContract",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "gameIDs",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        name: "gameResults",
        outputs: [
          {
            internalType: "string",
            name: "winningNumber",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "awayScore",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "homeScore",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "gameTokenAwarded",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
        ],
        name: "getGameIDByIndex",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "gameID",
            type: "string",
          },
        ],
        name: "getGameResult",
        outputs: [
          {
            components: [
              {
                internalType: "string",
                name: "winningNumber",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "awayScore",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "homeScore",
                type: "uint256",
              },
            ],
            internalType: "struct PayoutContract.GameResult",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGameResultsLength",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getWeeklyDataLength",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "matchWinners",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "nftContract",
        outputs: [
          {
            internalType: "contract IERC721",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string[]",
            name: "gameIDsInput",
            type: "string[]",
          },
          {
            internalType: "uint256[]",
            name: "awayScores",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "homeScores",
            type: "uint256[]",
          },
        ],
        name: "submitGameScores",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256[]",
            name: "tokenIDs",
            type: "uint256[]",
          },
          {
            internalType: "address[]",
            name: "walletAddresses",
            type: "address[]",
          },
          {
            internalType: "string[]",
            name: "gridValues",
            type: "string[]",
          },
        ],
        name: "submitWeeklyData",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "tokenWinnings",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "tokenWins",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "weeklyData",
        outputs: [
          {
            internalType: "uint256",
            name: "tokenID",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "walletAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "gridValue",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "withdrawExcessFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    // Call the function to send API data to the smart contract
    await sendApiDataToSmartContract(data, contractAddress, abi);
  } catch (error) {
    console.error("Error in handleApiDataSubmission:", error);
    alert("Failed to fetch or process API data. Check console for details.");
  }
}

// Attach the function to the button click event
document.getElementById("sendApiDataButton").addEventListener("click", () => {
  console.log("Send API Data button clicked!");
  handleApiDataSubmission();
});
