import { gridState } from "./web3Connect.js";

const contractAddress = "0x76108A653D9F8B021663Cf35F0F505c0A1712890"; // Payout Contract v13
const contractABI = [
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

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner(); // Get the user's wallet
const contract = new ethers.Contract(contractAddress, contractABI, signer);

async function submitWeeklyData() {
  try {
    // Check if wallet is connected
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("Wallet not connected. Please connect your wallet.");
    }

    // Proceed with your data submission
    const tokenIDs = [];
    const walletAddresses = [];
    const gridValues = [];

    for (const gridId in gridState) {
      const gridItem = gridState[gridId];
      if (gridItem.tokenId && gridItem.walletAddress && gridItem.gridValue) {
        tokenIDs.push(gridItem.tokenId);
        walletAddresses.push(gridItem.walletAddress);
        gridValues.push(gridItem.gridValue);
      } else {
        console.warn(`Incomplete data for gridId: ${gridId}`);
      }
    }

    console.log("Data prepared for submission:");
    console.log({ tokenIDs, walletAddresses, gridValues });

    const tx = await contract.submitWeeklyData(
      tokenIDs,
      walletAddresses,
      gridValues
    );
    console.log("Transaction submitted:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
  } catch (error) {
    console.error("Error submitting weekly data:", error);
    alert("Error: " + error.message);
  }
}

// Bind submitWeeklyData function to the Send GridState button
document
  .getElementById("sendGridStateButton")
  .addEventListener("click", async () => {
    await submitWeeklyData();
  });
