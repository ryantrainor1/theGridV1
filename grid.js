import { gridState } from "./web3Connect.js";

let gridValues = {}; // Define gridValues globally or at the top of the script.

// Example Initialization Flow of Saving the Board State
window.onload = function () {
  checkAllStaked(); // Call this to ensure the run button is appropriately enabled/disabled
};

// Function to check if all grid spaces are staked and have random numbers assigned
function checkAllStaked() {
  const runButton = document.getElementById("scriptButton");

  // Count total grid spaces and staked grid spaces
  const totalGridSpaces = Object.keys(gridState).length;
  const stakedGridSpaces = Object.values(gridState).filter(
    (gridItem) => gridItem.tokenId !== undefined
  ).length;

  // Log the current status of gridState
  console.log(`Total grid spaces: ${totalGridSpaces}`);
  console.log(`Staked grid spaces: ${stakedGridSpaces}`);
  console.log("Current gridState:", gridState);

  // Enable the button if all grid spaces are staked
  if (stakedGridSpaces === totalGridSpaces && totalGridSpaces === 100) {
    runButton.disabled = false; // Enable the button
    console.log("All items staked, enabling run button");
    // Dispatch the custom event only when the grid is fully filled
    dispatchGridFilledEvent();
  } else {
    runButton.disabled = true; // Disable the button
    console.log("Not all grid spaces are staked, keeping run button disabled");
  }
}

function dispatchGridFilledEvent() {
  // Check if all grid spaces are filled and have a valid gridValue assigned
  const totalGridSpaces = Object.keys(gridState).length;
  const filledSpaces = Object.values(gridState).filter(
    (cell) => cell.gridValue !== null && cell.gridValue !== undefined
  ).length;

  if (filledSpaces === totalGridSpaces && totalGridSpaces === 100) {
    // Dispatch a custom event with the fully populated gridState
    const event = new CustomEvent("gridFilledAndSaved", {
      detail: { gridState },
    });
    document.dispatchEvent(event);
    console.log(
      "Dispatching gridFilledAndSaved event with fully populated gridState:",
      gridState
    );
  } else {
    console.error(
      "Attempted to dispatch gridFilledAndSaved with incomplete data. Waiting for full population."
    );
  }
}

// Function to reset the board
export function resetGrid() {
  try {
    localStorage.removeItem("gridState");
    localStorage.removeItem("leaderboardState");

    gridState = {};
    leaderboardState = [];

    const gridCells = document.querySelectorAll(".item");
    gridCells.forEach((cell) => {
      cell.className = "item";
      cell.innerHTML = `
        <button class="item-button" data-grid-id="${cell.id}">
          STAKE
        </button>
      `;

      const button = cell.querySelector(".item-button");
      if (button) {
        button.addEventListener("click", (e) => {
          const gridId = e.target.dataset.gridId;
          openTokenIdModal(gridId);
        });
      }
    });

    const nftDisplaySection = document.getElementById("nft-list");
    if (nftDisplaySection) {
      nftDisplaySection.innerHTML = `<h3>Your Staked NFTs</h3>`;
    }

    const leaderboardBody = document.querySelector("#leaderboard tbody");
    if (leaderboardBody) {
      leaderboardBody.innerHTML = "";
    }

    console.log("Grid and leaderboard reset.");
    alert("Grid reset complete.");
  } catch (error) {
    console.error("Error resetting grid:", error);
  }
}

export function runRandomNumberScript() {
  generateRandomNumbers()
    .then(() => {
      console.log("Random numbers generated successfully");
      document.getElementById("scriptButton").disabled = true; // Disable the button after running the script
      const allValuesReady = storeGridValues(); // Ensure grid values are stored and validated

      checkAllStaked(); // Re-check if everything is correctly populated and ready
    })
    .catch((error) => {
      console.error("Error generating random numbers:", error);
    })
    .finally(() => {
      storeData(); // Ensure storeData is called regardless of the outcome of generateRandomNumbers
    });
}

function generateRandomNumbers() {
  return updateColumns()
    .then(updateRows)
    .then(storeGridValues)
    .then(storeData) // Store data in localStorage after all operations
    .then(() => {
      console.log("Random numbers generated successfully");
      document.getElementById("scriptButton").disabled = true; // Disable the button after running the script
    })
    .then(dispatchGridFilledEvent) // Script to check if every grid space has a random value
    .catch((error) => {
      console.error("Error generating random numbers:", error);
    });
}

function updateColumns() {
  return fetch("http://127.0.0.1:5000/generate-random-numbers")
    .then((response) => response.json())
    .then((numbers) => {
      const items = document.querySelectorAll(".rand_column");
      numbers.forEach((number, index) => {
        if (items[index]) {
          items[index].textContent = number;
        }
      });
      storeGridValues(); // Store the grid values instead of displaying them
    })
    .catch((error) => console.error("Error:", error));
}

function updateRows() {
  return fetch("http://127.0.0.1:5000/generate-random-numbers")
    .then((response) => response.json())
    .then((numbers) => {
      const items = document.querySelectorAll(".rand_row");
      numbers.forEach((number, index) => {
        if (items[index]) {
          items[index].textContent = number;
        }
      });
      storeGridValues(); // Store the grid values instead of displaying them
    })
    .catch((error) => console.error("Error:", error));
}

// Function to store grid values
// Function to store grid values and update gridState
function storeGridValues() {
  const columns = Array.from(document.querySelectorAll(".rand_column"));
  const rows = Array.from(document.querySelectorAll(".rand_row"));

  if (!columns.length || !rows.length) {
    console.error("Random column or row elements not found.");
    return false; // Exit if no columns/rows are found
  }

  const headerValues = { columns: [], rows: [] }; // Object to store header values
  gridValues = {}; // Clear previous gridValues

  // Store column and row values
  columns.forEach((col, index) => {
    const colValue = col.textContent.trim();
    headerValues.columns[index] = colValue;
  });

  rows.forEach((row, index) => {
    const rowValue = row.textContent.trim();
    headerValues.rows[index] = rowValue;
  });

  // Combine column and row values into gridValues
  for (let col = 0; col < columns.length; col++) {
    for (let row = 0; row < rows.length; row++) {
      const gridItemId = `row_${col}_${row}`;
      const gridValue = `${headerValues.columns[col]}${headerValues.rows[row]}`;
      gridValues[gridItemId] = gridValue;

      // Update gridState
      if (gridState[gridItemId]) {
        gridState[gridItemId].gridValue = gridValue;
      } else {
        console.warn(`Grid item ${gridItemId} not found in gridState.`);
      }
    }
  }

  // Save to localStorage
  localStorage.setItem("headerValues", JSON.stringify(headerValues));
  localStorage.setItem("gridValues", JSON.stringify(gridValues));
  localStorage.setItem("gridState", JSON.stringify(gridState));
  console.log("Header values, grid values, and grid state stored.");

  // Save finalized state to local storage
  saveGlobalState();

  // Dispatch grid filled event with finalized state
  const event = new CustomEvent("gridFilledAndSaved", {
    detail: { gridState },
  });
  document.dispatchEvent(event);

  console.log(
    "Dispatched gridFilledAndSaved with finalized gridState:",
    gridState
  );

  return true; // Indicate success
}

// Function to store data in localStorage
function storeData() {
  localStorage.setItem("gridValues", JSON.stringify(gridValues));
}

// Initial call to disable the button on page load
checkAllStaked();

// Example Initialization Flow of Saving the Board State
window.onload = function () {
  checkAllStaked(); // Call this to ensure the run button is appropriately enabled/disabled
};

// Ensure this runs only after grid is fully populated
if (checkAllStaked()) {
  dispatchGridFilledEvent();
}
