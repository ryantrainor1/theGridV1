// claim.js

const connectWalletButton = document.getElementById("connectWalletButton");
const walletAddressElement = document.getElementById("walletAddress");
const resultsSection = document.getElementById("resultsSection");
const resultsContainer = document.getElementById("resultsContainer");
const contractBalanceElement = document.getElementById("contractBalance");

// NFT CONTRACT Smart Contract Details
const nftContractAddress = "0x05FF60B96CB3dB409D3F376Ca6E0E85184F75f60"; // NFT Contract v4
const nftContractABI = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_rewardsWallet",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_pooledFundsWallet",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721InsufficientApproval",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC721InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "ERC721InvalidOperator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721InvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC721InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC721InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721NonexistentToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "COMMON_LIMIT",
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
    name: "MAX_SUPPLY",
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
    name: "MINT_PRICE",
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
    name: "RARE_LIMIT",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
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
    name: "commonCount",
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
    name: "commonMetadataURI",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
        name: "",
        type: "uint256",
      },
    ],
    name: "isRare",
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
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
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
    inputs: [],
    name: "pooledFundsWallet",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rareCount",
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
    name: "rareMetadataURI",
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardsWallet",
    outputs: [
      {
        internalType: "address payable",
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
    inputs: [],
    name: "symbol",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
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
    inputs: [],
    name: "totalMinted",
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "walletMintCount",
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
]; // Paste your ABI here

// PAYOUT CONTRACT Smart Contract Details
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
]; // Paste your ABI here

// Connect Wallet

// Get loading overlay element
const loadingOverlay = document.getElementById("loadingOverlay");

// Show and hide overlay within the results section
function showOverlay() {
  const overlay = document.querySelector("#loadingOverlay");
  overlay.classList.add("active");
}

function hideOverlay() {
  const overlay = document.querySelector("#loadingOverlay");
  overlay.classList.remove("active");
}

// Connect Wallet and Load Data
async function connectWallet() {
  if (window.ethereum) {
    try {
      // Show overlay when the connect button is clicked
      showOverlay();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Display wallet address and update button
      walletAddressElement.textContent = `Connected Wallet: ${walletAddress}`;
      connectWalletButton.textContent = "Wallet Connected";

      // Fetch contract balance and game results
      await fetchContractBalance();
      await fetchGameResults(walletAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      // Hide overlay regardless of success or failure
      hideOverlay();
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// Fetch Contract Balance
async function fetchContractBalance() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    const formattedBalance = ethers.utils.formatEther(balance);

    contractBalanceElement.textContent = `Contract Balance: ${formattedBalance} ETH`;
    console.log("Contract balance fetched successfully:", formattedBalance);
  } catch (error) {
    console.error("Error fetching contract balance:", error);
    contractBalanceElement.textContent = "Unable to fetch contract balance.";
  }
}

// Fetch Results

// Fetch Game Results and Claimable Winnings
// Update fetchGameResults to Use Loading Logic
async function fetchGameResults(walletAddress) {
  try {
    showOverlay(); // Show the loading overlay
    console.log("Fetching game results...");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    // Fetch weekly data and results
    const weeklyDataLength = await contract.getWeeklyDataLength();
    console.log(`Total weekly data entries: ${weeklyDataLength}`);
    resultsContainer.innerHTML = ""; // Clear previous results

    let resultCount = 0; // Track how many results were displayed

    for (let i = 0; i < weeklyDataLength; i++) {
      const weeklyData = await contract.weeklyData(i);
      const tokenID = weeklyData.tokenID;
      const gridValue = weeklyData.gridValue;

      // Fetch winnings for token
      const winnings = await contract.tokenWinnings(tokenID);
      const winningsInEther = ethers.utils.formatEther(winnings);

      // Verify ownership using ownerOf from the ERC-721 contract
      const actualOwner = await fetchCurrentOwner(tokenID);

      if (
        actualOwner !== walletAddress.toLowerCase() || // Skip if not owned
        parseFloat(winnings) <= 0 // Skip if no winnings
      ) {
        console.log(
          `Skipping Token ID ${tokenID}. Owner: ${actualOwner}, Winnings: ${winningsInEther} ETH`
        );
        continue;
      }

      // Fetch matched game IDs
      const matchedGameIDs = await fetchMatchedGameIDs(contract, tokenID);
      console.log(`Matched Game IDs for Token ID ${tokenID}:`, matchedGameIDs);

      // Create result card
      const resultCard = document.createElement("div");
      resultCard.className = "result-card hidden"; // Initially hidden
      resultCard.innerHTML = `
        <p><strong>Token ID:</strong> ${tokenID}</p>
        <p><strong>Grid Value:</strong> ${gridValue}</p>
        <p><strong>Matched GameIDs:</strong> ${
          matchedGameIDs.join(", ") || "N/A"
        }</p>
        <p><strong>Claimable Winnings:</strong> ${winningsInEther} ETH</p>
        <button class="btn-primary" onclick="claimWinnings(${tokenID})">Claim</button>
      `;

      resultsContainer.appendChild(resultCard);

      // Bounce in and fade effect
      setTimeout(() => {
        resultCard.classList.remove("hidden");
        resultCard.classList.add("visible");
      }, resultCount * 300); // Adjust delay per card (300ms per result)

      resultCount++;
    }

    resultsSection.classList.remove("hidden");

    if (resultCount === 0) {
      alert("No claimable winnings found for your wallet.");
    }
  } catch (error) {
    console.error("Error fetching game results:", error);
    alert("Failed to fetch game results. Please try again.");
  } finally {
    hideOverlay(); // Hide the loading overlay after fetching is complete
  }
}

// Fetch Matched Game IDs for a Token
async function fetchMatchedGameIDs(contract, tokenID) {
  try {
    const matchedGameIDs = [];
    const gameResultsLength = await contract.getGameResultsLength();

    // Fetch the gridValue for the tokenID from the weekly data
    const weeklyDataLength = await contract.getWeeklyDataLength();
    let gridValue = null;

    for (let i = 0; i < weeklyDataLength; i++) {
      const weeklyData = await contract.weeklyData(i);
      if (weeklyData.tokenID.toString() === tokenID.toString()) {
        // Ensure correct comparison
        gridValue = weeklyData.gridValue;
        break;
      }
    }

    if (!gridValue) {
      console.error(`Grid value not found for Token ID ${tokenID}`);
      return [];
    }

    console.log(`Grid value for Token ID ${tokenID}: ${gridValue}`);

    // Compare the gridValue with winning numbers in game results
    for (let i = 0; i < gameResultsLength; i++) {
      const gameID = await contract.getGameIDByIndex(i);
      const gameResult = await contract.getGameResult(gameID);

      if (gameResult.winningNumber === gridValue) {
        matchedGameIDs.push(gameID);
      }
    }

    console.log(`Matched Game IDs for Token ID ${tokenID}:`, matchedGameIDs);
    return matchedGameIDs;
  } catch (error) {
    console.error(
      `Error fetching matched Game IDs for Token ID ${tokenID}:`,
      error
    );
    return [];
  }
}

// Helper Function to get current owner of tokenID
async function fetchCurrentOwner(tokenID) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nftContract = new ethers.Contract(
      nftContractAddress,
      nftContractABI,
      provider
    );
    const owner = await nftContract.ownerOf(tokenID);
    return owner.toLowerCase(); // Normalize the address
  } catch (error) {
    console.error(`Error fetching owner for Token ID ${tokenID}:`, error);
    return null; // Return null if an error occurs
  }
}

// Claim Winnings for a Token
async function claimWinnings(tokenID) {
  console.log(`Attempting to claim winnings for Token ID: ${tokenID}`);

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.claimWinningsByToken(tokenID);
    console.log("Transaction sent. Waiting for confirmation...");
    await tx.wait();
    console.log("Winnings claimed successfully for Token ID:", tokenID);

    alert(`Successfully claimed winnings for Token ID: ${tokenID}`);
    connectWallet(); // Refresh the data
  } catch (error) {
    console.error(`Error claiming winnings for Token ID ${tokenID}:`, error);
    alert("Failed to claim winnings. Please try again.");
  }
}

// Event Listener for Wallet Connection
connectWalletButton.addEventListener("click", connectWallet);
